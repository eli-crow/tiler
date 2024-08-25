import { Tileset4x4PlusEditor } from "../../editor/Tileset4x4PlusEditor";
import { Tileset4x4JigsawEditor as RawTilesetEditor } from "../../editor/Tileset4x4PlusJigsawEditor";
import { TileEditorProvider } from "../providers/TilesetEditorProvider";
import { TilesetEditor } from "./TilesetEditor";
import classes from "./TilesetEditorPage.module.css";
import { TilesetEditorToolbar } from "./TilesetEditorToobar";

const tileset = new Tileset4x4PlusEditor();
const editor = new RawTilesetEditor(tileset);

export function TilesetEditorPage() {
  return (
    <div className={classes.root}>
      <TileEditorProvider value={editor}>
        <TilesetEditor />
        <TilesetEditorToolbar />
      </TileEditorProvider>
    </div>
  );
}
