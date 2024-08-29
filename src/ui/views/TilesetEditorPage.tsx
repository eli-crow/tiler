import { TilesetEditorPageProvider, useTilesetEditorPageState } from "../providers/TilesetEditorPageProvider";
import classes from "./TilesetEditorPage.module.css";
import { TilesetEditorToolbar } from "./TilesetEditorToolbar";
import { TilesetEditorToolSettings } from "./TilesetEditorToolSettings";
import { TilesetEditorTopbar } from "./TilesetEditorTopbar";
import { TilesetEditorView } from "./TilesetEditorView";

export type TilesetEditorPageMode = "raw" | "jigsaw" | "terrain";

export function TilesetEditorPage() {
  const context = useTilesetEditorPageState();

  return (
    <div className={classes.root}>
      <TilesetEditorPageProvider value={context}>
        <TilesetEditorTopbar />
        <TilesetEditorView />
        <TilesetEditorToolSettings />
        <TilesetEditorToolbar />
      </TilesetEditorPageProvider>
    </div>
  );
}
