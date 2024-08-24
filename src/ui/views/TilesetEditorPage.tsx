import { TilesetEditor as RawTilesetEditor } from "../../editor/TilesetEditor";
import { Tileset4x4Plus } from "../../editor/tileset/Tileset4x4Plus";
import { TileEditorProvider } from "../providers/TilesetEditorProvider";
import { TilesetEditor } from "./TilesetEditor";
import classes from "./TilesetEditorPage.module.css";
import { TilesetEditorToolbar } from "./TilesetEditorToobar";

const tileset = new Tileset4x4Plus();
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
