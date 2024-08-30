import { mergeClasses } from "../../utilities";
import BackIcon from "../icons/back.svg?react";
import { useTilesetEditorPageContext } from "../providers/TilesetEditorPageProvider";
import classes from "./TilesetEditorTopbar.module.css";

export function TilesetEditorTopbar() {
  const page = useTilesetEditorPageContext();
  return (
    <div className={mergeClasses(classes.root, "surface-translucent")}>
      <button className={classes.back}>
        <BackIcon />
      </button>
      <h1 className={classes.title}>{page.tilesetName}</h1>
      <div className={classes.modeGroup}>
        <button className={classes.mode} aria-current={page.mode === "raw"} onClick={() => page.setMode("raw")}>
          Raw
        </button>
        <button className={classes.mode} aria-current={page.mode === "jigsaw"} onClick={() => page.setMode("jigsaw")}>
          Jigsaw
        </button>
        <button className={classes.mode} aria-current={page.mode === "terrain"} onClick={() => page.setMode("terrain")}>
          Terrain
        </button>
      </div>
    </div>
  );
}
