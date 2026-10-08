# Interview Buddy

Private interview practice for a first junior .NET / full stack role. Paste a CV and job description, choose focus and difficulty, practise 3–5 questions, receive feedback, retry, and reflect. React + TypeScript, FastAPI, SQLite, Ollama. No agent framework, cloud inference, analytics, fonts or runtime CDN assets.

## Run without Docker

Requirements: Python 3.9+ (3.12 recommended), Node 22+, and [Ollama](https://ollama.com/download). Download dependencies and weights while online:

```sh
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt
npm ci --prefix frontend
ollama pull qwen2.5:7b
```

Copy `.env.example` to `.env` if changing defaults. FastAPI does not automatically read this file; export its values in the backend terminal (or pass environment variables directly). Compose reads `.env` automatically.

Start Ollama if its desktop app is not already running:

```sh
ollama serve
```

In a second terminal, from the repository root:

```sh
.venv/bin/uvicorn app:app --app-dir backend --host 127.0.0.1 --port 8000 --no-access-log
```

In a third terminal:

```sh
npm run dev --prefix frontend
```

Open http://127.0.0.1:5173. Vite proxies `/api` to the backend; inference never leaves the backend. For preview without Ollama, choose **Try a sample**. Demo questions and feedback are fixed synthetic examples, never an assessment of submitted answers.

## Docker Compose

```sh
docker compose up --build -d
docker compose exec ollama ollama pull qwen2.5:7b
```

Open http://127.0.0.1:8080. Only the frontend publishes a port, bound to localhost. Ollama and backend are private Compose services. Named volumes retain model weights and explicitly saved sessions. `docker compose down` stops services without erasing volumes. Use the app’s deletion controls for saved sessions.

On macOS, native Ollama uses Apple GPU acceleration; Docker Ollama generally runs on CPU, which can be much slower. For native Ollama, use the non-Docker setup. GPU acceleration inside Linux containers requires additional host configuration; this Compose file assumes CPU inference.

## Model, license and hardware

Default: **Qwen2.5 7B Instruct**, Ollama tag `qwen2.5:7b`, Q4_K_M quantization, **4.7 GB** weights. The selected 7B model uses **Apache 2.0**; other sizes can have different licenses. Verified against official sources on 2026-10-08:

- [Ollama model listing: tag, size, quantization and license](https://ollama.com/library/qwen2.5:7b)
- [Qwen’s official 7B Instruct license](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE)
- [Ollama FAQ: memory, context and GPU/CPU loading](https://docs.ollama.com/faq)
- [Ollama GPU support](https://docs.ollama.com/gpu)

Hardware sizing is workload dependent, not a guaranteed official minimum. Allow more than the 4.7 GB weight size for context cache, runtime and OS. **16 GB system RAM recommended for this app**; 8 GB may struggle with its 8,192-token context. CPU works but is slower; a supported GPU with enough free memory improves latency. Budget at least 6 GB free disk for weights plus dependencies. These RAM/disk budgets are practical estimates, not vendor guarantees. Check `ollama ps` for actual CPU/GPU use and memory pressure. Configure `OLLAMA_MODEL` to another installed open model if needed; check its license separately.

## Privacy and limitations

- **Save this session locally** is unchecked by default. Without consent, profile, answers and feedback remain in browser memory and in transient backend requests; refresh loses them. No browser localStorage, cookies or session persistence.
- Opting in writes the profile, plan, attempts, feedback, flags and summary to local SQLite. Consent applies throughout that session. The SQLite file is **unencrypted**; use OS disk encryption. History only contains saved sessions.
- Individual deletion removes a saved record. **Delete all local data** removes all records, compacts SQLite and clears the current browser session. OS backups/snapshots remain outside app control. Model weights are retained.
- No raw CV or answers are logged by application code. Access logging is disabled in startup commands. Avoid enabling debug/body logging. Ollama handles transient prompts; its runtime diagnostics and OS swap/crash dumps remain outside this app’s control.
- CVs, jobs and answers are sent as explicitly untrusted JSON evidence. Structured output, schema validation and one repair attempt constrain responses. Prompt injection and hallucinations cannot be eliminated; check all advice and use **Flag questionable feedback**. Flags stay local, visible in history and included in summary context; they are not external reports.
- Improved answers must use supplied experience or explicitly label hypothetical examples. The model can violate these instructions. Do not present invented experience as your own. No scores or hiring predictions.
- Session state is client managed; local API users could alter saved feedback. This is a personal single-user app, without authentication. Keep it on localhost. Do not deploy publicly.
- After installing dependencies, building images/assets and pulling the model, core practice works offline. First setup, upgrades and model downloads require internet. Demo works without a model. Browser refresh discards unsaved work. Extremely long CVs/jobs can exceed the model’s context despite character limits; shorten them if output quality degrades.
- Cancel stops the client request and backend inference connection. Ollama may continue computing briefly. If a save was already committed when cancellation occurred, consult history before retrying. Failed saves show an error; in-memory progress stays available.

## Troubleshooting

- **Ollama offline:** start its app or `ollama serve`; check `curl http://127.0.0.1:11434/api/tags`.
- **Missing model:** `ollama pull qwen2.5:7b` (or configured tag). In Compose, run inside the Ollama service.
- **Timeout:** close other memory-heavy apps, use native Ollama/GPU, shorten inputs, or export `OLLAMA_TIMEOUT=240` before starting the backend. Nginx waits 300 seconds; update its timeout if setting a longer backend timeout.
- **Invalid JSON twice:** retry or select a stronger structured-output model. There is no cloud fallback.
- **Frontend cannot reach backend:** confirm port 8000, use the Vite proxy or Compose rather than opening built HTML directly.
- **Endpoint rejected:** backend accepts only local HTTP endpoints (`localhost`, loopback, or Compose `ollama`). Do not expose Ollama publicly.

## Checks

```sh
(cd backend && ../.venv/bin/python -m pytest -q)
npm run check --prefix frontend
npm run lint --prefix frontend
.venv/bin/pip install -r backend/requirements-dev.txt
.venv/bin/ruff check backend
npm run build --prefix frontend
.venv/bin/python -m compileall -q backend
```

Tests mock inference and cover Pydantic validation, duplicate plans, consent, API workflow, flags, persistence/update/deletion, malformed output repair, model errors, timeouts and cancellation. They do not establish real model answer quality. See `docs/validation.md` for actual executed checks and limitations.

Hand-off: [walkthrough](docs/walkthrough.md), [feedback template](docs/feedback-template.md), [challenge draft](docs/challenge-submission.md). Synthetic CV and vacancy are in `samples/`.
