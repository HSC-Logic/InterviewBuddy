import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

// ponytail: edited browser captures, not continuous native screen recording; replace with a video track when footage is available.
const screens = [
  {
    image: "01-prepare",
    title: "A calm place to practise",
    caption: "Prepare for your first junior developer interview.",
  },
  {
    image: "02-demo",
    title: "An honest preview",
    caption: "Synthetic demo. Fixed feedback. No live AI assessment.",
  },
  {
    image: "03-context",
    title: "Bring your background",
    caption: "Paste your CV and the job description. Choose a role.",
  },
  {
    image: "04-consent",
    title: "Your saving choice",
    caption: "Saving is optional. Here, only synthetic data is saved.",
  },
  {
    image: "05-question",
    title: "One question at a time",
    caption: "A short plan. Technical, behavioural, or mixed practice.",
  },
  {
    image: "06-answer",
    title: "Find your own words",
    caption: "Type an answer. Clear reasoning beats perfect phrasing.",
  },
  {
    image: "07-feedback",
    title: "Reflect on your answer",
    caption: "Live mode requests strengths, corrections, and clarity advice.",
  },
  {
    image: "08-flagged",
    title: "Question the feedback",
    caption: "Flag advice you want to verify. AI can be incorrect.",
  },
  {
    image: "09-improved",
    title: "Learn from an example",
    caption: "Hypothetical examples are labelled. Never invent experience.",
  },
  {
    image: "10-retry",
    title: "Try a clearer answer",
    caption: "Retry the same question. Keep your previous attempts.",
  },
  {
    image: "11-debugging",
    title: "Practise how you think",
    caption: "Explain how you would investigate a slow database query.",
  },
  {
    image: "12-behavioural",
    title: "Tell your actual story",
    caption: "For behavioural answers, use STAR with your own experience.",
  },
  {
    image: "13-summary",
    title: "Take a useful next step",
    caption: "Finish with strengths, revision topics, and next practice.",
  },
  {
    image: "14-next-step",
    title: "Keep the useful parts",
    caption: "Review attempts and flagged feedback before your next round.",
  },
  {
    image: "15-history",
    title: "A private practice log",
    caption:
      "Saved history restores your session. Deletion controls are local.",
  },
  {
    image: "16-restored",
    title: "Pick up where you left off",
    caption: "This saved synthetic session was reopened successfully.",
  },
  {
    image: "17-local-setup",
    title: "Local AI, clearly shown",
    caption: "Ollama is offline in this demo. Connect it for live feedback.",
  },
];

export const Workflow = () => {
  const frame = useCurrentFrame();
  const current = Math.min(Math.floor(frame / 84), screens.length - 1);
  const screen = screens[current];
  const local = frame % 84;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#132d35",
        color: "#f0f5ee",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 65,
          left: 85,
          fontSize: 26,
          letterSpacing: 2,
          color: "#b6ccb7",
        }}
      >
        INTERVIEW BUDDY
      </div>
      <div
        style={{
          position: "absolute",
          top: 116,
          left: 85,
          fontSize: 23,
          color: "#d7c68f",
        }}
      >
        SYNTHETIC DEMO · EDITED BROWSER CAPTURES
      </div>
      <div
        style={{
          position: "absolute",
          top: 193,
          left: 85,
          right: 85,
          fontSize: 55,
          fontWeight: 600,
          lineHeight: 1.15,
        }}
      >
        {screen.title}
      </div>
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 225,
          width: 630,
          height: 1301,
          overflow: "hidden",
          borderRadius: 23,
          border: "2px solid #42615a",
          boxShadow: "0 25px 70px #0005",
          opacity: interpolate(local, [0, 8], [0.45, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Img
          src={staticFile(`capture/${screen.image}.jpg`)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: 1665,
          left: 85,
          right: 85,
          fontSize: 37,
          lineHeight: 1.45,
          color: "#d5e3d4",
        }}
      >
        {screen.caption}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 78,
          left: 85,
          right: 85,
          height: 5,
          backgroundColor: "#36544e",
        }}
      >
        <div
          style={{
            width: `${((current + 1) / screens.length) * 100}%`,
            height: "100%",
            backgroundColor: "#9abf94",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 109,
          right: 85,
          fontSize: 24,
          color: "#a6bda9",
        }}
      >
        {String(current + 1).padStart(2, "0")} / 17
      </div>
    </AbsoluteFill>
  );
};
