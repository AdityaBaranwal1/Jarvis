import React from "react";
import JarvisIcon from "../icons/JarvisIcon";

interface MascotProps {
  /** Height in px. */
  size: number;
  /** Wave once on arrival, or high-five (re-key it to play again). */
  animation?: "wave" | "slap" | null;
}

// The design's 357×400 image box, kept so sizes and the wave's pivot match it.
const BOX_ASPECT = 357 / 400;

/** The Jarvis mark (upstream: Handy's mascot glove), optionally animated. */
export const Mascot: React.FC<MascotProps> = ({ size, animation = null }) => (
  <span
    style={{ width: size * BOX_ASPECT, height: size }}
    className={`relative block origin-[50%_90%] rotate-[-8deg] select-none ${animation === "wave" ? "animate-wave" : animation === "slap" ? "animate-slap" : ""}`}
  >
    <span className="absolute start-[6%] top-[12%] block h-[76%] w-[88%]">
      <JarvisIcon width="100%" height="100%" />
    </span>
  </span>
);
