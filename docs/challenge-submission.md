# Interview Buddy — submission draft

## Who it is for
A friend preparing for their first software engineering job, with a default focus on junior .NET / full stack development. The intended problem is explaining technical answers clearly and confidently. Their name, personal background and actual experience should be added only with permission: [optional, verified details].

## What I built
A private practice app that uses a CV and job description to create a short interview, ask one question at a time, give supportive feedback, support retries and provide a session reflection. Saving is optional; locally saved sessions can be revisited or deleted. A clearly labelled synthetic demo helps preview the workflow without pretending to run live AI.

Demo link: [add only after an actual demo is recorded]
Repository: [actual repository URL]

## Open components
React and TypeScript provide the interface. Python FastAPI and Pydantic handle the API and model output validation. SQLite stores opted-in sessions. Ollama runs Qwen2.5 7B locally; the selected model is Apache 2.0 licensed. Docker Compose packages the services. No cloud AI or agent framework is required.

## Why local, open AI matters
A CV and interview answers can contain sensitive personal details. Local inference keeps this material on the user's machine, avoids recurring cloud API charges, allows model choice, and supports offline practice after initial downloads. Open weights make that local operation possible. Hardware needs and model mistakes remain real tradeoffs.

## Limitations and learning
Real model quality requires hands-on evaluation. Prompt boundaries and JSON validation cannot guarantee factual correctness or prevent every injected instruction. SQLite is unencrypted, inference can be slow on CPU, and unsaved sessions disappear on refresh. The app is for localhost single-user use. Tests use mocked inference; actual executed checks and missing validation are in docs/validation.md.

Implementation lesson: a small client-managed session and explicit saving choice can support the workflow without an agent framework. Reliable failure states and honest demo labels matter as much as the happy path.

## Actual friend feedback
[What helped — fill in after real use]
[What confused them — fill in after real use]
[Requested changes — fill in after real use]
[Testimonial — only include an actual quote with permission]
