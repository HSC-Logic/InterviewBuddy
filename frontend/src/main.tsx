import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

type Profile = {
  cv: string;
  job: string;
  role: string;
  mode: "technical" | "behavioural" | "mixed";
  difficulty: "gentle" | "standard" | "stretch";
};
type Question = {
  topic: string;
  question: string;
  kind: "technical" | "behavioural";
};
type Plan = { introduction: string; questions: Question[] };
type Feedback = {
  well: string[];
  missing: string[];
  clarity: string[];
  improved_answer: string;
  follow_up: string;
};
type Attempt = {
  question_index: number;
  answer: string;
  feedback: Feedback;
  flagged: boolean;
};
type Summary = { strengths: string[]; revise: string[]; next_practice: string };
type Session = {
  profile: Profile;
  plan: Plan;
  attempts: Attempt[];
  summary: Summary | null;
  demo: boolean;
};
type History = { id: string; created: string; role: string; demo: boolean };
const cv =
  "Synthetic candidate: Alex. Completed a computing diploma. Built a personal task tracker using C#, ASP.NET Core, SQLite and React. Implemented CRUD endpoints and practised Git. No professional software engineering experience.";
const job =
  "Synthetic job: Junior Full Stack Developer. Work with C#, ASP.NET Core REST APIs, SQL and React. Debug issues, write basic tests, use Git, and learn deployment. Clear communication and willingness to learn are valued.";
const initial: Profile = {
  cv: "",
  job: "",
  role: "Junior .NET / Full Stack Developer",
  mode: "mixed",
  difficulty: "gentle",
};
const demoPlan = (p: Profile): Plan => ({
  introduction: `A gentle warm-up for ${p.role}. Practise explaining your reasoning in plain language, then connect it to a real example.`,
  questions: [
    {
      topic: "REST APIs",
      question:
        "What makes an API RESTful, and how would you choose HTTP methods for a task tracker?",
      kind: "technical",
    },
    {
      topic: "SQL & debugging",
      question:
        "A task list loads slowly. How would you investigate whether the database query is the problem?",
      kind: "technical",
    },
    {
      topic: "Communication",
      question:
        "Tell me about a time you got stuck while learning or building something. How did you move forward?",
      kind: "behavioural",
    },
  ]
    .filter((q) => p.mode === "mixed" || q.kind === p.mode)
    .concat(
      p.mode === "mixed"
        ? []
        : p.mode === "technical"
          ? [
              {
                topic: "C#",
                question: "How do you handle a null value safely in C#?",
                kind: "technical",
              },
            ]
          : [
              {
                topic: "Learning",
                question:
                  "How would you approach learning an unfamiliar tool for your first team?",
                kind: "behavioural",
              },
              {
                topic: "Teamwork",
                question:
                  "How would you ask a teammate for help after investigating a bug?",
                kind: "behavioural",
              },
            ],
    ) as Question[],
});
const demoFeedback: Feedback = {
  well: [
    "Submitting an answer is a useful first step. This preview does not evaluate what you wrote.",
  ],
  missing: [
    "Live local AI will identify technical errors and missing details here.",
  ],
  clarity: [
    "Start with a one-sentence definition, explain your reasoning, then give a short example.",
  ],
  improved_answer:
    "Hypothetical example — not your experience: “For a task resource, GET reads tasks, POST creates one, PATCH updates fields, and DELETE removes one. I would use meaningful status codes and validate input.” For a behavioural question, provide your own situation, task, action and result; do not borrow a fictional story.",
  follow_up:
    "What is one concrete example you could use to explain your reasoning?",
};
const demoSummary: Summary = {
  strengths: [
    "You completed a practice round. This synthetic preview does not assess your answers.",
  ],
  revise: ["Review HTTP methods, query debugging, and the STAR structure."],
  next_practice:
    "Try live local AI with your own CV. Pick one topic and explain it aloud in under two minutes.",
};
async function api<T>(
  path: string,
  method = "GET",
  data?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const r = await fetch("/api" + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: data === undefined ? undefined : JSON.stringify(data),
    signal,
  });
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error(
      typeof e.detail === "string"
        ? e.detail
        : `Request failed (${r.status}). Check your input and local server.`,
    );
  }
  return r.json();
}
function App() {
  const [page, setPage] = useState<
    "prepare" | "setup" | "practice" | "history" | "summary"
  >("prepare");
  const [profile, setProfile] = useState<Profile>(initial),
    [session, setSession] = useState<Session | null>(null),
    [index, setIndex] = useState(0),
    [answer, setAnswer] = useState(""),
    [feedback, setFeedback] = useState<Feedback | null>(null),
    [save, setSave] = useState(false),
    [savedId, setSavedId] = useState<string | null>(null),
    [demo, setDemo] = useState(false);
  const [status, setStatus] = useState({
      ready: false,
      model: "qwen2.5:7b",
      message: "Checking local AI…",
    }),
    [history, setHistory] = useState<History[]>([]),
    [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const controller = useRef<AbortController | null>(null),
    lock = useRef(false);
  async function run(
    label: string,
    action: (signal: AbortSignal) => Promise<void>,
  ) {
    if (lock.current) return;
    lock.current = true;
    setBusy(label);
    setError("");
    setNotice("");
    controller.current = new AbortController();
    try {
      await action(controller.current.signal);
    } catch (e) {
      setError(
        e instanceof DOMException && e.name === "AbortError"
          ? "Cancelled. Your previous progress is still available."
          : e instanceof Error
            ? e.message
            : "Something went wrong. Please retry.",
      );
    } finally {
      lock.current = false;
      setBusy("");
      controller.current = null;
    }
  }
  async function check() {
    try {
      setStatus(await api("/status"));
    } catch {
      setStatus({
        ready: false,
        model: "qwen2.5:7b",
        message: "Backend unavailable. Start the FastAPI server.",
      });
    }
  }
  useEffect(() => {
    void check();
    return () => controller.current?.abort();
  }, []);
  async function persist(s: Session, signal: AbortSignal) {
    if (save) {
      const result = await api<{ id: string }>(
        "/sessions",
        "POST",
        { session: s, consent: true, id: savedId },
        signal,
      );
      setSavedId(result.id);
    }
  }
  function loadDemo() {
    setDemo(true);
    setProfile({ ...initial, cv, job });
    setNotice("Synthetic demo loaded. No live AI inference.");
  }
  function start() {
    void run(
      demo ? "Preparing preview…" : "Building your interview…",
      async (signal) => {
        const plan = demo
          ? demoPlan(profile)
          : await api<Plan>("/plan", "POST", profile, signal);
        const s: Session = { profile, plan, attempts: [], summary: null, demo };
        setSession(s);
        setIndex(0);
        setAnswer("");
        setFeedback(null);
        setSavedId(null);
        setPage("practice");
        if (save) {
          const result = await api<{ id: string }>(
            "/sessions",
            "POST",
            { session: s, consent: true },
            signal,
          );
          setSavedId(result.id);
        }
      },
    );
  }
  function submit() {
    if (!session || !answer.trim()) return;
    void run(
      session.demo
        ? "Showing sample feedback…"
        : "Thinking through your answer…",
      async (signal) => {
        const f = session.demo
          ? demoFeedback
          : await api<Feedback>(
              "/feedback",
              "POST",
              {
                profile: session.profile,
                question: session.plan.questions[index],
                answer,
              },
              signal,
            );
        const s = {
          ...session,
          attempts: [
            ...session.attempts,
            { question_index: index, answer, feedback: f, flagged: false },
          ],
        };
        setSession(s);
        setFeedback(f);
        await persist(s, signal);
      },
    );
  }
  function finish() {
    if (!session) return;
    void run("Putting your progress together…", async (signal) => {
      const summary = session.demo
        ? demoSummary
        : await api<Summary>("/summary", "POST", session, signal);
      const s = { ...session, summary };
      setSession(s);
      setPage("summary");
      await persist(s, signal);
    });
  }
  function flag() {
    if (!session) return;
    const attempts = [...session.attempts];
    const last = attempts.map((a) => a.question_index).lastIndexOf(index);
    if (last < 0) return;
    attempts[last] = { ...attempts[last], flagged: !attempts[last].flagged };
    const s = { ...session, attempts };
    setSession(s);
    void run("Saving feedback flag…", async (signal) => persist(s, signal));
  }
  function viewHistory() {
    setPage("history");
    void run("Loading saved sessions…", async (signal) =>
      setHistory(await api<History[]>("/sessions", "GET", undefined, signal)),
    );
  }
  function reset() {
    if (
      session &&
      !save &&
      !window.confirm("Discard this temporary session and start again?")
    )
      return;
    setSession(null);
    setSavedId(null);
    setFeedback(null);
    setAnswer("");
    setPage("prepare");
  }
  const question = session?.plan.questions[index];
  const flagged = session?.attempts
    .filter((a) => a.question_index === index)
    .at(-1)?.flagged;
  return (
    <div className="app">
      <aside>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            if (!busy) setPage("prepare");
          }}
        >
          <span className="logo">
            ib<span>.</span>
          </span>
          <span>
            interview
            <br />
            <b>buddy</b>
          </span>
        </a>
        <div className="side-label">YOUR PRACTICE SPACE</div>
        <nav aria-label="Main navigation">
          {[
            ["prepare", "Prepare", "01"],
            ["setup", "Local AI setup", "02"],
            ["history", "Past sessions", "03"],
          ].map(([p, label, n]) => (
            <button
              disabled={!!busy}
              key={p}
              className={page === p ? "active" : ""}
              onClick={() =>
                p === "history" ? viewHistory() : setPage(p as typeof page)
              }
            >
              <span>{n}</span>
              {label}
            </button>
          ))}
          {session && (
            <button
              disabled={!!busy}
              onClick={() => setPage(session.summary ? "summary" : "practice")}
            >
              ↳ Resume session
            </button>
          )}
        </nav>
        <div className="side-bottom">
          <div className={"connection " + (status.ready ? "ready" : "")}>
            <i />
            {status.ready ? "Local AI connected" : "Local AI offline"}
          </div>
          <p>
            Your words stay on your machine.
            <br />
            Your progress belongs to you.
          </p>
          <span className="small">PRIVATE BY DESIGN</span>
        </div>
      </aside>
      <main>
        <header>
          <span>A LITTLE PRACTICE. A LOT MORE CONFIDENCE.</span>
          <button
            disabled={!!busy}
            className="text-button"
            onClick={() => setPage("setup")}
          >
            Local AI <span className={status.ready ? "dot green" : "dot"} />
          </button>
        </header>
        {demo && (
          <div className="demo-banner">
            SYNTHETIC DEMO · Fixed sample questions and feedback. No live AI
            assessment.{" "}
            <button
              disabled={!!busy || !!session}
              onClick={() => setDemo(false)}
            >
              Use live AI
            </button>
          </div>
        )}
        {error && (
          <div className="alert" role="alert">
            {error}
          </div>
        )}
        {notice && (
          <div className="notice" role="status">
            {notice}
          </div>
        )}
        {busy && (
          <div className="loading" role="status">
            <span className="spinner" />
            {busy}
            <button onClick={() => controller.current?.abort()}>
              Cancel request
            </button>
          </div>
        )}
        {page === "prepare" && (
          <>
            <div className="eyebrow">LET’S GET YOU READY</div>
            <h1>
              Your next chapter
              <br />
              starts with <em>practice.</em>
            </h1>
            <p className="lead">
              A friendly place to find your words, sharpen your answers,
              <br className="desktop" /> and walk into your first interview
              feeling more like yourself.
            </p>
            <div className="steps">
              <span className="current">
                1 <b>Bring your background</b>
              </span>
              <span>
                2 <b>Practise one question</b>
              </span>
              <span>
                3 <b>Build your confidence</b>
              </span>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                start();
              }}
            >
              <div className="form-top">
                <div>
                  <h2>Make it your interview</h2>
                  <p>Two bits of context. A practice session made for you.</p>
                </div>
                <button
                  type="button"
                  className="text-button"
                  disabled={!!busy}
                  onClick={loadDemo}
                >
                  Try a sample ↗
                </button>
              </div>
              <div className="input-grid">
                <label>
                  Your CV{" "}
                  <span>Paste plain text · leave out sensitive details</span>
                  <textarea
                    required
                    minLength={10}
                    maxLength={20000}
                    value={profile.cv}
                    onChange={(e) =>
                      setProfile({ ...profile, cv: e.target.value })
                    }
                    placeholder="Your projects, skills, education, and experience…"
                  />
                </label>
                <label>
                  The job description{" "}
                  <span>What does your next role look like?</span>
                  <textarea
                    required
                    minLength={10}
                    maxLength={20000}
                    value={profile.job}
                    onChange={(e) =>
                      setProfile({ ...profile, job: e.target.value })
                    }
                    placeholder="Paste the role, responsibilities, and skills they’re looking for…"
                  />
                </label>
              </div>
              <label className="role">
                Target role
                <input
                  required
                  maxLength={200}
                  value={profile.role}
                  onChange={(e) =>
                    setProfile({ ...profile, role: e.target.value })
                  }
                />
              </label>
              <div className="options">
                <fieldset>
                  <legend>Practice focus</legend>
                  <div className="segments">
                    {(["mixed", "technical", "behavioural"] as const).map(
                      (v) => (
                        <button
                          type="button"
                          aria-pressed={profile.mode === v}
                          className={profile.mode === v ? "selected" : ""}
                          key={v}
                          onClick={() => setProfile({ ...profile, mode: v })}
                        >
                          {v === "mixed"
                            ? "A bit of both"
                            : v[0].toUpperCase() + v.slice(1)}
                        </button>
                      ),
                    )}
                  </div>
                </fieldset>
                <label>
                  Difficulty
                  <select
                    value={profile.difficulty}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        difficulty: e.target.value as Profile["difficulty"],
                      })
                    }
                  >
                    <option value="gentle">Gentle · build foundations</option>
                    <option value="standard">
                      Standard · find your rhythm
                    </option>
                    <option value="stretch">
                      Stretch · challenge yourself
                    </option>
                  </select>
                </label>
              </div>
              <div className="form-footer">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={save}
                    onChange={(e) => setSave(e.target.checked)}
                  />
                  <span>
                    Save this session locally
                    <small>
                      Unchecked? Nothing is saved. Refresh clears your session.
                    </small>
                  </span>
                </label>
                <button
                  className="primary"
                  disabled={!!busy || (!status.ready && !demo)}
                >
                  Start practising <span>↗</span>
                </button>
              </div>
            </form>
            <div className="reassurance">
              <span>◇ No perfect answers needed</span>
              <span>◉ Local, open AI</span>
              <span>↻ Room to try again</span>
            </div>
            <p className="disclaimer">
              AI feedback can be incorrect. Use it as a practice partner; verify
              technical advice. Flag anything questionable.
            </p>
          </>
        )}
        {page === "setup" && (
          <>
            <div className="eyebrow">ON YOUR MACHINE, ON YOUR TERMS</div>
            <h1>
              Your private
              <br />
              <em>practice partner.</em>
            </h1>
            <section className="card">
              <h2>
                {status.ready ? "You’re ready to practise" : "Connect local AI"}
              </h2>
              <p>{status.message}</p>
              <p>
                Configured model: <code>{status.model}</code>
              </p>
              <ol>
                <li>Install Ollama using the README.</li>
                <li>
                  Download the model: <code>ollama pull {status.model}</code>
                </li>
                <li>
                  Start Ollama: <code>ollama serve</code>
                </li>
              </ol>
              <button
                className="primary"
                disabled={!!busy}
                onClick={() =>
                  void run("Checking connection…", async () => check())
                }
              >
                Check connection
              </button>{" "}
              <button
                disabled={!!busy}
                onClick={() => {
                  loadDemo();
                  setPage("prepare");
                }}
              >
                Explore synthetic demo
              </button>
            </section>
            <section className="card">
              <h2>Privacy, in plain language</h2>
              <p>
                Only the backend contacts your local Ollama service. No cloud
                AI, analytics, or remote fonts. Saving is optional. Saved CVs
                and answers live in an unencrypted SQLite database on this
                machine. Use your OS disk encryption for sensitive information.
              </p>
              <p>
                Temporary sessions live in browser memory and disappear on
                refresh. Flagged feedback stays in your session; nothing is sent
                to a third party.
              </p>
            </section>
          </>
        )}
        {page === "practice" && session && question && (
          <>
            <div className="eyebrow">
              {session.demo ? "SYNTHETIC PREVIEW" : "YOUR PRACTICE SESSION"} ·{" "}
              {save ? "SAVED LOCALLY" : "TEMPORARY"}
            </div>
            <div className="session-heading">
              <h1>
                One question.
                <br />
                <em>Take your time.</em>
              </h1>
              <span className="count">
                {String(index + 1).padStart(2, "0")}{" "}
                <small>
                  / {String(session.plan.questions.length).padStart(2, "0")}
                </small>
              </span>
            </div>
            <p className="lead">{session.plan.introduction}</p>
            <div
              className="progress"
              aria-label={`Question ${index + 1} of ${session.plan.questions.length}`}
            >
              {session.plan.questions.map((_, i) => (
                <i key={i} className={i <= index ? "filled" : ""} />
              ))}
            </div>
            <section className="card question">
              <span className="tag">
                {question.kind} · {question.topic}
              </span>
              <h2>{question.question}</h2>
              <p>
                Think it through. A clear explanation matters more than a
                perfect phrase.
              </p>
              <label>
                Your answer
                <textarea
                  maxLength={10000}
                  value={answer}
                  disabled={!!feedback || !!busy}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Start with what you know…"
                />
              </label>
              {!feedback && (
                <button
                  className="primary"
                  disabled={
                    !!busy || !answer.trim() || session.attempts.length >= 30
                  }
                  onClick={submit}
                >
                  Get feedback ↗
                </button>
              )}
            </section>
            {feedback && (
              <section className="card feedback">
                <div className="form-top">
                  <h2>A little reflection</h2>
                  <button
                    disabled={!!busy}
                    aria-pressed={flagged || false}
                    onClick={flag}
                  >
                    {flagged
                      ? "Flagged for review"
                      : "Flag questionable feedback"}
                  </button>
                </div>
                {[
                  ["What went well", feedback.well],
                  ["Points to revisit", feedback.missing],
                  ["Make it clearer", feedback.clarity],
                ].map(([title, items]) => (
                  <div key={title as string}>
                    <h3>{title as string}</h3>
                    <ul>
                      {(items as string[]).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                <h3>An example improved answer</h3>
                <blockquote>{feedback.improved_answer}</blockquote>
                <h3>A follow-up to think about</h3>
                <p>{feedback.follow_up}</p>
                <p className="disclaimer">
                  AI can make mistakes. Verify advice. No hiring predictions or
                  formal assessment.
                </p>
                <div className="actions">
                  <button disabled={!!busy} onClick={() => setFeedback(null)}>
                    Retry this question
                  </button>
                  {index < session.plan.questions.length - 1 ? (
                    <button
                      className="primary"
                      disabled={!!busy}
                      onClick={() => {
                        setIndex(index + 1);
                        setAnswer("");
                        setFeedback(null);
                      }}
                    >
                      Next question ↗
                    </button>
                  ) : (
                    <button
                      className="primary"
                      disabled={!!busy}
                      onClick={finish}
                    >
                      See my reflection ↗
                    </button>
                  )}
                </div>
              </section>
            )}
            <div className="actions">
              <button disabled={!!busy} onClick={reset}>
                Start over
              </button>
              {session.attempts.length > 0 && !session.summary && (
                <button disabled={!!busy} onClick={finish}>
                  Finish session early
                </button>
              )}
            </div>
          </>
        )}
        {page === "summary" && session?.summary && (
          <>
            <div className="eyebrow">
              PROGRESS, ONE ANSWER AT A TIME ·{" "}
              {session.demo
                ? "SYNTHETIC DEMO"
                : save
                  ? "SAVED LOCALLY"
                  : "TEMPORARY"}
            </div>
            <h1>
              You showed up.
              <br />
              <em>That’s a good start.</em>
            </h1>
            <p className="lead">
              {session.attempts.length} answers practised. Keep the useful
              parts. Question the rest.
            </p>
            <div className="input-grid">
              <section className="card">
                <h2>Your strengths</h2>
                <ul>
                  {session.summary.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </section>
              <section className="card">
                <h2>Worth another look</h2>
                <ul>
                  {session.summary.revise.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </section>
            </div>
            <section className="card">
              <h2>Your next small step</h2>
              <p>{session.summary.next_practice}</p>
            </section>
            <section className="card">
              <h2>Your answers & reflections</h2>
              {session.attempts.map((a, i) => (
                <details key={i}>
                  <summary>
                    {session.plan.questions[a.question_index].topic} · Attempt{" "}
                    {i + 1}
                    {a.flagged ? " · Flagged" : ""}
                  </summary>
                  <p>{session.plan.questions[a.question_index].question}</p>
                  <blockquote>{a.answer}</blockquote>
                  <h3>What went well</h3>
                  <ul>
                    {a.feedback.well.map((s, n) => (
                      <li key={n}>{s}</li>
                    ))}
                  </ul>
                  <h3>Points to revisit</h3>
                  <ul>
                    {a.feedback.missing.map((s, n) => (
                      <li key={n}>{s}</li>
                    ))}
                  </ul>
                  <h3>Clarity</h3>
                  <ul>
                    {a.feedback.clarity.map((s, n) => (
                      <li key={n}>{s}</li>
                    ))}
                  </ul>
                  <p>{a.feedback.improved_answer}</p>
                  <p>Follow-up: {a.feedback.follow_up}</p>
                </details>
              ))}
            </section>
            <button className="primary" disabled={!!busy} onClick={reset}>
              Practise again ↗
            </button>
          </>
        )}
        {page === "history" && (
          <>
            <div className="eyebrow">YOUR PERSONAL PRACTICE LOG</div>
            <h1>
              Look how far
              <br />
              <em>you’ve come.</em>
            </h1>
            <p className="lead">Only sessions you chose to save appear here.</p>
            {history.length === 0 ? (
              <section className="card">
                <h2>A fresh page</h2>
                <p>
                  No saved sessions yet. A little practice is a great place to
                  start.
                </p>
              </section>
            ) : (
              history.map((h) => (
                <section className="card history-row" key={h.id}>
                  <div>
                    <h2>{h.role}</h2>
                    <p>
                      {new Date(h.created).toLocaleString()}{" "}
                      {h.demo ? "· Synthetic demo" : ""}
                    </p>
                  </div>
                  <div className="actions">
                    <button
                      disabled={!!busy}
                      onClick={() =>
                        void run("Opening session…", async (signal) => {
                          const s = await api<Session>(
                            "/sessions/" + h.id,
                            "GET",
                            undefined,
                            signal,
                          );
                          setSession(s);
                          setSavedId(h.id);
                          setSave(true);
                          setDemo(s.demo);
                          setProfile(s.profile);
                          const last = s.attempts.at(-1);
                          setIndex(last?.question_index ?? 0);
                          setAnswer(last?.answer ?? "");
                          setFeedback(last?.feedback ?? null);
                          setPage(s.summary ? "summary" : "practice");
                        })
                      }
                    >
                      Open
                    </button>
                    <button
                      disabled={!!busy}
                      onClick={() => {
                        if (
                          window.confirm(
                            "Permanently delete this saved session?",
                          )
                        )
                          void run("Deleting session…", async (signal) => {
                            await api(
                              "/sessions/" + h.id,
                              "DELETE",
                              undefined,
                              signal,
                            );
                            setHistory(history.filter((x) => x.id !== h.id));
                            if (savedId === h.id) {
                              setSavedId(null);
                              setSave(false);
                            }
                          });
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </section>
              ))
            )}
            <button
              className="danger"
              disabled={!!busy}
              onClick={() => {
                if (
                  window.confirm(
                    "Delete all saved CVs, job descriptions, answers and feedback on this machine? This cannot be undone.",
                  )
                )
                  void run("Deleting local data…", async (signal) => {
                    await api("/sessions", "DELETE", undefined, signal);
                    setHistory([]);
                    setSession(null);
                    setProfile(initial);
                    setAnswer("");
                    setFeedback(null);
                    setSavedId(null);
                    setSave(false);
                  });
              }}
            >
              Delete all local data
            </button>
            <p className="disclaimer">
              Deletion removes app records. OS backups or disk snapshots may
              retain copies.
            </p>
          </>
        )}
        <footer>
          <span>Made for your first step forward.</span>
          <span>Interview Buddy · local & private</span>
        </footer>
      </main>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
