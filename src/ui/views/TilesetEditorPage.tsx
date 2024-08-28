import { useState } from "react";
import { EXAMPLE_TERRAIN_TILES, GODOT_NEIGHBORS, GODOT_TILES } from "../../editor/model";
import { BaseTileset } from "../../editor/tileset/BaseTileset";
import { Tileset4x4Plus } from "../../editor/tileset/Tileset4x4Plus";
import { Tileset4x4PlusJigsaw } from "../../editor/tileset/Tileset4x4PlusJigsaw";
import { Tileset4x4PlusTerrain } from "../../editor/tileset/Tileset4x4PlusTerrain";
import { TilesetEditor } from "../../editor/TilesetEditor";
import { PencilTool } from "../../editor/tools/PencilTool";
import { TileEditorProvider } from "../providers/TilesetEditorProvider";
import { TilesetProvider } from "../providers/TilesetProvider";
import classes from "./TilesetEditorPage.module.css";
import { TilesetEditorToolbar } from "./TilesetEditorTools";
import { TilesetEditorView } from "./TilesetEditorView";

const tileset4x4Plus = new Tileset4x4Plus();
const tileset4x4PlusJigsaw = new Tileset4x4PlusJigsaw(tileset4x4Plus, GODOT_TILES);
const tileset4x4PlusTerrain = new Tileset4x4PlusTerrain(tileset4x4PlusJigsaw, GODOT_NEIGHBORS, EXAMPLE_TERRAIN_TILES);

const editor4x4Plus = new TilesetEditor(tileset4x4Plus, new PencilTool());
const editor4x4PlusJigsaw = new TilesetEditor(tileset4x4PlusJigsaw, new PencilTool());
const editor4x4PlusTerrain = new TilesetEditor(tileset4x4PlusTerrain, new PencilTool());

export function TilesetEditorPage() {
  const [editorType, setEditorType] = useState<"raw" | "jigsaw" | "terrain">("raw");

  let tileset: BaseTileset;
  let editor: TilesetEditor;
  if (editorType === "raw") {
    tileset = tileset4x4Plus;
    editor = editor4x4Plus;
  } else if (editorType === "jigsaw") {
    tileset = tileset4x4PlusJigsaw;
    editor = editor4x4PlusJigsaw;
  } else if (editorType === "terrain") {
    tileset = tileset4x4PlusTerrain;
    editor = editor4x4PlusTerrain;
  } else {
    throw new Error(`Invalid editor type: ${editorType}`);
  }

  return (
    <div className={classes.root}>
      <div className={classes.topbar}>
        <button onClick={() => setEditorType("raw")}>Raw</button>
        <button onClick={() => setEditorType("jigsaw")}>Jigsaw</button>
        <button onClick={() => setEditorType("terrain")}>Terrain</button>
      </div>
      <TilesetProvider value={tileset}>
        <TileEditorProvider value={editor}>
          <TilesetEditorView />
          <TilesetEditorToolbar />
        </TileEditorProvider>
      </TilesetProvider>
    </div>
  );
}
