import { useState } from "react";
import { Tileset4x4PlusEditor } from "../../editor/Tileset4x4PlusEditor";
import { Tileset4x4JigsawEditor as RawTilesetEditor } from "../../editor/Tileset4x4PlusJigsawEditor";
import { TileEditorProvider } from "../providers/TilesetEditorProvider";
import { TilesetEditor } from "./TilesetEditor";
import classes from "./TilesetEditorPage.module.css";
import { TilesetEditorToolbar } from "./TilesetEditorToobar";

const editor4x4Plus = new Tileset4x4PlusEditor();
const editor4x4PlusJigsaw = new RawTilesetEditor(editor4x4Plus);

export function TilesetEditorPage() {
  const [editorType, setEditorType] = useState<"raw" | "jigsaw">("raw");

  return (
    <div className={classes.root}>
      <div className={classes.topbar}>
        <button onClick={() => setEditorType("raw")}>Raw</button>
        <button onClick={() => setEditorType("jigsaw")}>Jigsaw</button>
      </div>
      <TileEditorProvider value={editorType === "raw" ? editor4x4Plus : editor4x4PlusJigsaw}>
        <TilesetEditor />
        <TilesetEditorToolbar />
      </TileEditorProvider>
    </div>
  );
}
