import { RgbaColor, RgbaColorPicker } from "react-colorful";
import { RGBA } from "../../editor/model";

export interface ColorPickerProps {
  color: RGBA;
  onChange: (color: RGBA) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const colorfulColor: RgbaColor = { r: color[0], g: color[1], b: color[2], a: color[3] / 255 };
  const onChangeInner = (color: RgbaColor) => {
    onChange([color.r, color.g, color.b, Math.round(color.a * 255)]);
  };
  return (
    <RgbaColorPicker
      color={colorfulColor}
      onChange={onChangeInner}
      style={{ width: "100%", aspectRatio: 1, height: "auto" }}
    />
  );
}
