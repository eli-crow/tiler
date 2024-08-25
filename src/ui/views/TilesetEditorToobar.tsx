import { useRef, useState } from "react";
import { TilesetEditorTool } from "../../editor/TilesetEditor";
import { PencilTool } from "../../editor/tools/PencilTool";
import { TileTool } from "../../editor/tools/TileTool";
import { Tool } from "../../editor/tools/Tool";
import { useTilesetEditor } from "../providers/TilesetEditorProvider";
import { PencilToolEditor } from "./PencilToolEditor";
import classes from "./TilesetEditorToobar.module.css";

export function TilesetEditorToolbar() {
  const editor = useTilesetEditor();

  const pencilTool = useRef(new PencilTool(editor));
  const tileTool = useRef(new TileTool(editor));
  const [tool, _setTool] = useState<Tool>((editor.tool = pencilTool.current));

  function setTool(tool: TilesetEditorTool) {
    editor.tool = tool;
    _setTool(tool);
  }

  return (
    <div className={classes.root}>
      <div className={classes.toolGroup}>
        <button
          className={classes.tool}
          data-active={tool === pencilTool.current}
          onClick={() => {
            setTool(pencilTool.current);
          }}
        >
          ✏️
        </button>
        <button
          className={classes.tool}
          data-active={tool === tileTool.current}
          onClick={() => {
            setTool(tileTool.current);
          }}
        >
          🀄
        </button>
      </div>
      {tool instanceof PencilTool && <PencilToolEditor tool={tool} />}
    </div>
  );
}
