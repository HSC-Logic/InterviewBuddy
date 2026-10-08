import asyncio
import json

import httpx
import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

import app as module

PROFILE = {
    "cv": "Synthetic learner with a C# task tracker.",
    "job": "Junior .NET developer building REST APIs.",
}
PLAN = {
    "introduction": "A useful junior warm-up.",
    "questions": [
        {"topic": topic, "question": question, "kind": "technical"}
        for topic, question in [
            ("REST", "How do HTTP methods work?"),
            ("SQL", "How do you investigate a slow query?"),
            ("C#", "What does null mean in C#?"),
        ]
    ],
}
FEEDBACK = {
    "well": ["You gave a definition."],
    "missing": ["Explain status codes."],
    "clarity": ["Use an example."],
    "improved_answer": "Hypothetical example: GET reads a task.",
    "follow_up": "When would you use POST?",
}
SUMMARY = {
    "strengths": ["Clear definition."],
    "revise": ["Status codes."],
    "next_practice": "Practise REST.",
}


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(module, "DB_PATH", str(tmp_path / "sessions.sqlite3"))
    with TestClient(module.app) as client:
        yield client


def test_validation():
    module.Plan.model_validate(PLAN)
    duplicate = dict(PLAN, questions=[PLAN["questions"][0]] * 3)
    with pytest.raises(ValidationError):
        module.Plan.model_validate(duplicate)
    with pytest.raises(ValidationError):
        module.Feedback.model_validate(dict(FEEDBACK, invented="extra"))
    with pytest.raises(ValidationError):
        module.Feedback.model_validate(dict(FEEDBACK, well=[]))


def test_workflow_and_storage(client, monkeypatch):
    async def fake(schema, task, data):
        return schema.model_validate(
            {module.Plan: PLAN, module.Feedback: FEEDBACK, module.Summary: SUMMARY}[
                schema
            ]
        )

    monkeypatch.setattr(module, "infer", fake)
    plan = client.post("/api/plan", json=PROFILE)
    assert plan.status_code == 200
    assert not __import__("pathlib").Path(module.DB_PATH).exists()
    feedback = client.post(
        "/api/feedback",
        json={
            "profile": PROFILE,
            "question": PLAN["questions"][0],
            "answer": "GET reads resources.",
        },
    )
    assert feedback.status_code == 200
    session = {
        "profile": PROFILE,
        "plan": plan.json(),
        "attempts": [
            {
                "question_index": 0,
                "answer": "GET reads resources.",
                "feedback": feedback.json(),
                "flagged": True,
            }
        ],
        "demo": False,
    }
    summary = client.post("/api/summary", json=session)
    assert summary.status_code == 200
    session["summary"] = summary.json()
    assert (
        client.post(
            "/api/sessions", json={"session": session, "consent": False}
        ).status_code
        == 422
    )
    sid = client.post(
        "/api/sessions", json={"session": session, "consent": True}
    ).json()["id"]
    assert len(client.get("/api/sessions").json()) == 1
    assert client.get("/api/sessions/" + sid).json()["attempts"][0]["flagged"]
    session["attempts"][0]["answer"] = "A retry."
    client.post("/api/sessions", json={"session": session, "consent": True, "id": sid})
    assert len(client.get("/api/sessions").json()) == 1
    assert (
        client.get("/api/sessions/" + sid).json()["attempts"][0]["answer"] == "A retry."
    )
    client.delete("/api/sessions/" + sid)
    assert client.get("/api/sessions/" + sid).status_code == 404
    client.post("/api/sessions", json={"session": session, "consent": True})
    client.delete("/api/sessions")
    assert client.get("/api/sessions").json() == []


def test_invalid_session(client):
    assert client.post("/api/plan", json={"cv": "", "job": ""}).status_code == 422
    assert (
        client.post(
            "/api/summary", json={"profile": PROFILE, "plan": PLAN, "attempts": []}
        ).status_code
        == 422
    )


def test_inference_repair_and_errors(monkeypatch):
    real_client = httpx.AsyncClient
    for responses, expected in [
        (["broken", json.dumps(PLAN)], 200),
        (["broken", "broken"], 502),
        ([404], 503),
        ([500], 503),
    ]:
        calls = []

        def handler(request):
            calls.append(json.loads(request.content))
            value = responses[min(len(calls) - 1, len(responses) - 1)]
            return httpx.Response(
                value if isinstance(value, int) else 200,
                json={"message": {"content": value}},
            )

        monkeypatch.setattr(
            module.httpx,
            "AsyncClient",
            lambda **kwargs: real_client(
                transport=httpx.MockTransport(handler), **kwargs
            ),
        )
        if expected == 200:
            assert (
                asyncio.run(module.infer(module.Plan, "Plan", PROFILE)).introduction
                == PLAN["introduction"]
            )
            assert len(calls) == 2
            assert calls[0]["format"]["type"] == "object"
            assert "UNTRUSTED" in calls[0]["messages"][1]["content"]
        else:
            with pytest.raises(module.HTTPException) as error:
                asyncio.run(module.infer(module.Plan, "Plan", PROFILE))
            assert error.value.status_code == expected

    def timeout(request):
        raise httpx.ReadTimeout("timeout")

    monkeypatch.setattr(
        module.httpx,
        "AsyncClient",
        lambda **kwargs: real_client(transport=httpx.MockTransport(timeout), **kwargs),
    )
    with pytest.raises(module.HTTPException) as error:
        asyncio.run(module.infer(module.Plan, "Plan", PROFILE))
    assert error.value.status_code == 504


def test_cancellation():
    class Disconnected:
        async def is_disconnected(self):
            return True

    async def check():
        with pytest.raises(module.HTTPException) as error:
            await module.cancellable(Disconnected(), asyncio.sleep(10))
        assert error.value.status_code == 499

    asyncio.run(check())


def test_status_and_mode(client, monkeypatch):
    real_client = httpx.AsyncClient

    def handler(request):
        return httpx.Response(200, json={"models": [{"name": module.MODEL}]})

    monkeypatch.setattr(
        module.httpx,
        "AsyncClient",
        lambda **kwargs: real_client(transport=httpx.MockTransport(handler), **kwargs),
    )
    assert client.get("/api/status").json()["ready"]

    async def wrong_mode(schema, task, data):
        return module.Plan.model_validate(PLAN)

    monkeypatch.setattr(module, "infer", wrong_mode)
    assert (
        client.post("/api/plan", json=dict(PROFILE, mode="behavioural")).status_code
        == 502
    )
    assert (
        client.get("/api/status", headers={"host": "untrusted.example"}).status_code
        == 400
    )
