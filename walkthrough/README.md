# Interview Buddy walkthrough

74.5-second, silent, portrait MP4 composed with Remotion. Uses actual browser screenshots from the synthetic app workflow, edited into a readable step-by-step walkthrough. This is **edited browser capture**, not continuous native screen recording or live AI inference. No personal CV, microphone audio or desktop windows are included.

```sh
npm ci
npm run lint
npx remotion studio --no-open
npx remotion render InterviewBuddy ../docs/media/interview-buddy-demo.mp4 --codec=h264 --crf=22 --concurrency=2
```

Frames and capture timestamps: `public/capture/`. Each scene is available in Studio. Output is committed in `docs/media/` for the requested GitHub demo link.
