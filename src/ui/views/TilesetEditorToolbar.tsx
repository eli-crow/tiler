import { JigsawTileTool } from "../../editor/tools/JigsawTileTool";
import { PencilTool } from "../../editor/tools/PencilTool";
import { TerrainTileTool } from "../../editor/tools/TerrainTileTool";
import { mergeClasses } from "../../utilities";
import ToolIconEraser from "../icons/tool-eraser.svg?react";
import ToolIconJigsaw from "../icons/tool-jigsaw-tile.svg?react";
import ToolIconPencil from "../icons/tool-pencil.svg?react";
import ToolIconTerrain from "../icons/tool-terrain-tile.svg?react";
import { useTilesetEditor } from "../providers/TilesetEditorPageProvider";
import classes from "./TilesetEditorToolbar.module.css";

export function TilesetEditorToolbar() {
  const editor = useTilesetEditor();
  return (
    <div className={mergeClasses(classes.root, "surface-translucent")}>
      <div className={classes.toolGroup}>
        <button
          className={classes.tool}
          data-active={editor.tool instanceof PencilTool && !editor.tool.erase}
          onClick={() => (editor.tool = new PencilTool())}
        >
          <ToolIconPencil />
        </button>
        <button
          className={classes.tool}
          data-active={editor.tool instanceof PencilTool && editor.tool.erase}
          onClick={() => (editor.tool = new PencilTool(true))}
        >
          <ToolIconEraser />
        </button>
        <button
          className={classes.tool}
          data-active={editor.tool instanceof JigsawTileTool}
          onClick={() => (editor.tool = new JigsawTileTool())}
        >
          <ToolIconJigsaw />
        </button>
        <button
          className={classes.tool}
          data-active={editor.tool instanceof TerrainTileTool}
          onClick={() => (editor.tool = new TerrainTileTool())}
        >
          <ToolIconTerrain />
        </button>
      </div>
    </div>
  );
}
