import { useTilesetEditorPageContext } from "../providers/TilesetEditorPageProvider";
import classes from "./TilesetEditorTopbar.module.css";

export function TilesetEditorTopbar() {
  const page = useTilesetEditorPageContext();
  return (
    <div className={classes.root}>
      <button onClick={() => page.setMode("raw")}>Raw</button>
      <button onClick={() => page.setMode("jigsaw")}>Jigsaw</button>
      <button onClick={() => page.setMode("terrain")}>Terrain</button>
    </div>
  );
}
