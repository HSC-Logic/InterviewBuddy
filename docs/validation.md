# Validation — 2026-10-08

Executed on the development machine:

- `python -m pytest -q`: **6 passed**. Mocked inference; validation, unique plans, consent, storage updates/deletion, flags, main API workflow, limited JSON repair, missing model/server errors, timeout, cancellation, status, mode enforcement and untrusted Host rejection.
- `npm run check --prefix frontend`: passed strict TypeScript checks.
- `npm run lint --prefix frontend`: passed frontend formatting checks. This script uses Prettier; it is not an ESLint rule suite.
- `ruff check backend`: passed Python lint.
- Python compile check: passed with `PYTHONPYCACHEPREFIX=/tmp/interviewbuddy-pycache` (default OS cache directory is outside the sandbox).
- Production Vite build: passed, 28 modules, approximately 207 KB JavaScript and 8.4 KB CSS before gzip. Transformation took around 1.5 minutes on this environment. Node 26 and bundled Node 24 both completed.
- `npm audit`: zero reported vulnerabilities after updating Vite and the transitive lockfile.
- `docker compose config --quiet`: passed.
- Local backend and frontend started; HTTP status reported Ollama unavailable.
- Runtime network source inspection: frontend fetches only same-origin `/api`; backend connects only to a validated local HTTP Ollama endpoint. No external fonts, analytics or CDN imports in source.
- Official Ollama model listing, Qwen license and Ollama FAQ retrieved for README verification.

Not verified:

- Real inference: no Ollama executable or responding service at `127.0.0.1:11434`. No model smoke test passed; model quality, latency and grounding remain unmeasured.
- Docker image build/start: Docker CLI exists, but daemon is stopped.
- Browser visual/end-to-end testing: in-app browser resolved port 5173 to an unrelated app, while the shell HTTP response was Interview Buddy. The unrelated tab was closed. Responsive CSS and accessible labels were implemented, but actual browser rendering was not verified.
- True network-disconnected end-to-end operation and real friend feedback were not tested.

No deployment, public URL or testimonial was created.
