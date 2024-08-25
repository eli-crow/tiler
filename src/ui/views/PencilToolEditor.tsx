import { useState } from "react";
import { RGBA } from "../../editor/model";
import { PencilTool } from "../../editor/tools/PencilTool";
import { ColorPicker } from "../components/ColorPicker";

interface PencilToolEditor {
  tool: PencilTool;
}

export function PencilToolEditor({ tool }: PencilToolEditor) {
  const [color, _setColor] = useState<RGBA>(tool.color);

  function setColor(color: RGBA) {
    tool.color = color;
    _setColor(color);
  }

  return <ColorPicker color={color} onChange={setColor} />;
}
