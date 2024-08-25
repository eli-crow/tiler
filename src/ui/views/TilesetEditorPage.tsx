import { useState } from "react";
import { Tileset4x4Plus } from "../../editor/tileset/Tileset4x4Plus";
import { Tileset4x4PlusToGodot } from "../../editor/tileset/Tileset4x4PlusToGodot";
import { TilesetEditor } from "../../editor/TilesetEditor";
import { PencilTool } from "../../editor/tools/PencilTool";
import { TileEditorProvider } from "../providers/TilesetEditorProvider";
import classes from "./TilesetEditorPage.module.css";
import { TilesetEditorToolbar } from "./TilesetEditorTools";
import { TilesetEditorView } from "./TilesetEditorView";

const tileset4x4Plus = new Tileset4x4Plus();
const tileset4x4PlusToGodot = new Tileset4x4PlusToGodot(tileset4x4Plus);

const editor4x4Plus = new TilesetEditor(tileset4x4Plus, new PencilTool());
const editor4x4PlusJigsaw = new TilesetEditor(tileset4x4PlusToGodot, new PencilTool());

export function TilesetEditorPage() {
  const [editorType, setEditorType] = useState<"raw" | "jigsaw">("raw");

  return (
    <div className={classes.root}>
      <div className={classes.topbar}>
        <button onClick={() => setEditorType("raw")}>Raw</button>
        <button onClick={() => setEditorType("jigsaw")}>Jigsaw</button>
      </div>
      <TileEditorProvider value={editorType === "raw" ? editor4x4Plus : editor4x4PlusJigsaw}>
        <TilesetEditorView />
        <TilesetEditorToolbar />
      </TileEditorProvider>
    </div>
  );
}
