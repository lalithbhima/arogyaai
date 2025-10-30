import React from "react";
import Svg, { Path, Rect } from "react-native-svg";

// This icon is designed to be visually identical to the Apple Face ID icon.
export default function FaceIdSVG({ size = 40, color = "#000" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      {/* Four corners */}
      <Path d="M23 9H14C11 9 9 11 9 14V23" stroke={color} strokeWidth={5} strokeLinecap="round"/>
      <Path d="M57 9H66C69 9 71 11 71 14V23" stroke={color} strokeWidth={5} strokeLinecap="round"/>
      <Path d="M23 71H14C11 71 9 69 9 66V57" stroke={color} strokeWidth={5} strokeLinecap="round"/>
      <Path d="M57 71H66C69 71 71 69 71 66V57" stroke={color} strokeWidth={5} strokeLinecap="round"/>
      {/* Eyes - thick vertical bars */}
      <Rect x={22.5} y={28} width={5} height={12} rx={2.5} fill={color} />
      <Rect x={52.5} y={28} width={5} height={12} rx={2.5} fill={color} />
      {/* Nose */}
      <Path d="M40 38V48" stroke={color} strokeWidth={5} strokeLinecap="round" />
      {/* Smile */}
      <Path d="M28 55C34 61 46 61 52 55" stroke={color} strokeWidth={5} strokeLinecap="round" />
    </Svg>
  );
}
