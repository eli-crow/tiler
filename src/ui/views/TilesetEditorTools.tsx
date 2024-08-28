import { JigsawTileTool } from "../../editor/tools/JigsawTileTool";
import { PencilTool } from "../../editor/tools/PencilTool";
import { TerrainTileTool } from "../../editor/tools/TerrainTileTool";
import { useTilesetEditor } from "../providers/TilesetEditorProvider";
import { PencilToolEditor } from "./PencilToolEditor";
import classes from "./TilesetEditorTools.module.css";

export function TilesetEditorToolbar() {
  const editor = useTilesetEditor();

  return (
    <div className={classes.root}>
      <div className={classes.toolGroup}>
        <button
          className={classes.tool}
          data-active={editor.tool instanceof PencilTool && !editor.tool.erase}
          onClick={() => (editor.tool = new PencilTool())}
        >
          ✏️
        </button>
        <button
          className={classes.tool}
          data-active={editor.tool instanceof PencilTool && editor.tool.erase}
          onClick={() => (editor.tool = new PencilTool(true))}
        >
          🧽
        </button>
        <button
          className={classes.tool}
          data-active={editor.tool instanceof JigsawTileTool}
          onClick={() => (editor.tool = new JigsawTileTool())}
        >
          🀄
        </button>
        <button
          className={classes.tool}
          data-active={editor.tool instanceof TerrainTileTool}
          onClick={() => (editor.tool = new TerrainTileTool())}
        >
          ⛰️
        </button>
      </div>

      {editor.tool instanceof PencilTool && !editor.tool.erase && <PencilToolEditor tool={editor.tool} />}
    </div>
  );
}
