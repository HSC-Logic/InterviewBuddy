import { Composition, Series } from "remotion";
import { TitleCard } from "./TitleCard";
import { Workflow } from "./Workflow";

const Walkthrough = () => (
  <Series>
    <Series.Sequence durationInFrames={144} name="Introduction">
      <TitleCard
        title={"Interview\nBuddy."}
        subtitle={"A little practice.\nA lot more confidence."}
        detail={
          "Private interview practice for\na friend’s first developer job.\n\nReal app. Synthetic demo inputs."
        }
      />
    </Series.Sequence>
    <Series.Sequence durationInFrames={1428} name="Recorded browser workflow">
      <Workflow />
    </Series.Sequence>
    <Series.Sequence durationInFrames={216} name="Local AI and limitations">
      <TitleCard
        title={"Your practice.\nYour machine."}
        subtitle={"Open-weight Qwen2.5 7B\nwith local Ollama inference."}
        detail={
          "No cloud AI. Saving is optional.\n\nDemo uses fixed feedback.\nReal inference is not verified yet.\n\nSource: github.com/HSC-Logic/InterviewBuddy"
        }
      />
    </Series.Sequence>
  </Series>
);

export const RemotionRoot = () => (
  <>
    <Composition
      id="InterviewBuddy"
      component={Walkthrough}
      width={1080}
      height={1920}
      fps={24}
      durationInFrames={1788}
    />
    <Composition
      id="Introduction"
      component={TitleCard}
      width={1080}
      height={1920}
      fps={24}
      durationInFrames={144}
      defaultProps={{
        title: "Interview\nBuddy.",
        subtitle: "A little practice.\nA lot more confidence.",
        detail:
          "Private interview practice for\na friend’s first developer job.\n\nReal app. Synthetic demo inputs.",
      }}
    />
    <Composition
      id="BrowserWorkflow"
      component={Workflow}
      width={1080}
      height={1920}
      fps={24}
      durationInFrames={1428}
    />
    <Composition
      id="Closing"
      component={TitleCard}
      width={1080}
      height={1920}
      fps={24}
      durationInFrames={216}
      defaultProps={{
        title: "Your practice.\nYour machine.",
        subtitle: "Open-weight Qwen2.5 7B\nwith local Ollama inference.",
        detail:
          "No cloud AI. Saving is optional.\n\nDemo uses fixed feedback.\nReal inference is not verified yet.\n\nSource: github.com/HSC-Logic/InterviewBuddy",
      }}
    />
  </>
);
