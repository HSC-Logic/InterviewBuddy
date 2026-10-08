import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

type Props = { title: string; subtitle: string; detail: string };
export const TitleCard = ({ title, subtitle, detail }: Props) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#132d35",
        color: "#f1f5ec",
        padding: 100,
        justifyContent: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 110,
          left: 100,
          fontSize: 28,
          letterSpacing: 5,
          color: "#a7c9ad",
        }}
      >
        BUILT FOR A FRIEND
      </div>
      <div
        style={{
          opacity: interpolate(frame, [0, 18], [0, 1], {
            extrapolateRight: "clamp",
          }),
          translate: `${interpolate(frame, [0, 18], [24, 0], { extrapolateRight: "clamp" })}px 0px`,
        }}
      >
        <div
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 118,
            lineHeight: 1.06,
            letterSpacing: -5,
            whiteSpace: "pre-line",
          }}
        >
          {title}
        </div>
        <div
          style={{
            width: 140,
            height: 5,
            background: "#92ba91",
            margin: "60px 0",
          }}
        />
        <div
          style={{
            fontSize: 46,
            lineHeight: 1.45,
            color: "#d2e2d3",
            whiteSpace: "pre-line",
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            fontSize: 31,
            lineHeight: 1.65,
            color: "#a5bbb2",
            marginTop: 55,
            whiteSpace: "pre-line",
          }}
        >
          {detail}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 115,
          left: 100,
          right: 100,
          borderTop: "1px solid #3b5455",
          paddingTop: 30,
          fontSize: 25,
          color: "#b5c7bb",
        }}
      >
        Interview Buddy · React + FastAPI + SQLite + Ollama
      </div>
    </AbsoluteFill>
  );
};
