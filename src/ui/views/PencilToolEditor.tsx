import { useState } from "react";
import { RgbaColorPicker } from "react-colorful";
import { RGBA } from "../../editor/model";
import { PencilTool } from "../../editor/tools/PencilTool";

interface PencilToolEditor {
  tool: PencilTool;
}

export function PencilToolEditor({ tool }: PencilToolEditor) {
  const [color, _setColor] = useState<RGBA>(tool.color);

  function setColor(color: RGBA) {
    tool.color = color;
    _setColor(color);
  }

  return (
    <div>
      <RgbaColorPicker color={color} onChange={setColor} />
    </div>
  );
}
