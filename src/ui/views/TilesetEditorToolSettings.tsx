import { PencilTool } from "../../editor/tools/PencilTool";
import { TerrainTileTool } from "../../editor/tools/TerrainTileTool";
import { mergeClasses } from "../../utilities";
import { useTilesetEditor } from "../providers/TilesetEditorProvider";
import { PencilToolEditor } from "./PencilToolEditor";
import { TerrainToolEditor } from "./TerrainToolEditor";
import classes from "./TilesetEditorToolSettings.module.css";

export function TilesetEditorToolSettings() {
  const editor = useTilesetEditor();

  return (
    <div className={mergeClasses(classes.root, "surface-translucent")}>
      {editor.tool instanceof PencilTool && !editor.tool.erase && <PencilToolEditor tool={editor.tool} />}
      {editor.tool instanceof TerrainTileTool && <TerrainToolEditor tool={editor.tool} />}
    </div>
  );
}
