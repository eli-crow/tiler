import { EraserTool } from "../../editor/tools/EraserTool";
import { PencilTool } from "../../editor/tools/PencilTool";
import { TileTool } from "../../editor/tools/TileTool";
import { useTilesetEditor } from "../providers/TilesetEditorProvider";
import { PencilToolEditor } from "./PencilToolEditor";
import classes from "./TilesetEditorToobar.module.css";

export function TilesetEditorToolbar() {
  const editor = useTilesetEditor();

  return (
    <div className={classes.root}>
      <div className={classes.toolGroup}>
        <button
          className={classes.tool}
          data-active={editor.tool instanceof PencilTool}
          onClick={() => (editor.tool = new PencilTool())}
        >
          ✏️
        </button>
        <button
          className={classes.tool}
          data-active={editor.tool instanceof EraserTool}
          onClick={() => (editor.tool = new EraserTool())}
        >
          🧽
        </button>
        <button
          className={classes.tool}
          data-active={editor.tool instanceof TileTool}
          onClick={() => (editor.tool = new TileTool())}
        >
          🀄
        </button>
      </div>
      {editor.tool instanceof PencilTool && <PencilToolEditor tool={editor.tool} />}
    </div>
  );
}
