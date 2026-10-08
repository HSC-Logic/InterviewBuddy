---
title: "Interview Buddy: Private Interview Practice for a Friend’s First Developer Job"
published: false
tags: devchallenge, weekendchallenge, hf26challenge
---

*This is a submission for the [Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01)*

## What I Built

I built **Interview Buddy** for a friend preparing for their first software engineering job. The focus is junior .NET / full stack development, especially practising how to explain technical answers clearly and confidently.

The app turns a CV and job description into a short practice interview. You choose technical, behavioural, or mixed questions and a difficulty level, then answer one question at a time.

Each answer receives feedback covering:

- What went well.
- Technical mistakes or missing points.
- How to explain the answer more clearly.
- An example improved answer.
- One relevant follow-up question.

You can retry a question and finish with a reflection on strengths, topics to revise, and suggested next practice. Behavioural coaching asks the model to use STAR without inventing a personal story. Improved answers must stick to supplied experience or clearly label hypothetical examples.

Privacy is part of the workflow: **Save this session locally** is optional and unchecked by default. Temporary sessions disappear on refresh. Saved sessions can be revisited or deleted individually, and there is a **Delete all local data** action. Users can also flag questionable feedback.

The interface uses a calm navy, green, and neutral palette, with readable questions, labelled controls, loading states, and a local-AI connection indicator. A clearly labelled synthetic demo previews the workflow without pretending to assess answers using live AI.

**Actual friend feedback:** [Add what helped, what confused them, and what they would change after they use the app. No testimonial collected yet.]

## Demo

**Video walkthrough:** [Watch or download Interview Buddy on GitHub](https://github.com/HSC-Logic/InterviewBuddy/blob/main/docs/media/interview-buddy-demo.mp4)

[Direct MP4 link](https://raw.githubusercontent.com/HSC-Logic/InterviewBuddy/main/docs/media/interview-buddy-demo.mp4) · 74.5 seconds · 1080 × 1920 · silent, with explanatory text.

Created with Remotion using actual captures of the running app’s synthetic workflow: context, saving consent, answers, feedback, retry, flagging, summary, and restored history. This is an edited browser-capture walkthrough, not continuous native screen recording or live AI inference.

The app currently runs locally; it has not been publicly deployed. The repository includes startup instructions, synthetic sample inputs, and a short hand-off walkthrough. The synthetic demo can be explored without downloading a model.

## Code

[Interview Buddy repository](https://github.com/HSC-Logic/InterviewBuddy)

The repository is public. The Remotion source and synthetic capture assets are included in `walkthrough/`.

## How I Built It

The app uses **React and TypeScript** for the frontend, **Python FastAPI** for the backend, and **SQLite** for sessions the user explicitly chooses to save.

The inference integration uses **Ollama** with **Qwen2.5 7B Instruct**, an open-weight model released under **Apache 2.0**. The model name and local endpoint are configurable. Only the backend sends inference requests to Ollama; there are no cloud AI calls.

The backend requests structured JSON and validates responses with **Pydantic**. Invalid output gets one repair attempt before a helpful error. The app handles missing models, unavailable Ollama, timeouts, and cancellation. CVs, job descriptions, and answers are treated as untrusted evidence rather than instructions.

I kept the architecture small: no agent framework. Docker Compose provides a convenient setup, and the README includes instructions for running without Docker.

**Validation:** six mocked tests passed, covering the API workflow, response validation, persistence and deletion, consent, repair, and failure handling. TypeScript checks, frontend formatting, Python lint, the production build, and Compose configuration validation also passed. The dependency audit reported zero vulnerabilities at the time of checking.

**Current limits:** real inference has not been tested because Ollama was unavailable in the build environment. Docker execution remains unverified. The synthetic workflow was checked in the browser, including retries, flagging, summary, saving, and history restoration. Saved SQLite data is unencrypted, and model feedback can be wrong. The app is intended for single-user localhost use; real friend testing is still pending.

The main lesson was that a focused workflow needs more than question generation: clear privacy choices, useful failure states, and honest feedback labels make practice easier to trust.

## Why Does Open Innovation Matter?

CVs and interview answers can contain personal information. Open weights and local inference make it possible to practise without sending those details to a hosted AI provider, while retaining the freedom to inspect the integration and change models.

After dependencies and weights are downloaded, the app is designed to support the core workflow offline. That complete local workflow would not be possible with a hosted-only, closed AI API. It also avoids per-request cloud AI charges, though local hardware, electricity, and inference speed remain tradeoffs.

For this project, open innovation means control over where personal data goes and how the practice tool works. It makes a small, private app possible without tying its usefulness to a cloud service.
