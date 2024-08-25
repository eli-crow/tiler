import { useState } from "react";
import { RGBA } from "../../editor/model";
import { PencilTool } from "../../editor/tools/PencilTool";
import { ColorPicker } from "../components/ColorPicker";
import { SwatchCollectionEditor } from "../components/SwatchCollectionEditor";
import classes from "./PencilToolEditor.module.css";

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
    <div className={classes.root}>
      <ColorPicker color={color} onChange={setColor} />
      <SwatchCollectionEditor onSelect={setColor} />
    </div>
  );
}
