import { useTilesetEditorPageContext } from "@/app/providers/TilesetEditorPageProvider";
import { mergeClasses } from "@/shared";
import EditableText from "../components/EditableText";
import classes from "./TilesetEditorTopbar.module.css";

export function TilesetEditorTopbar() {
  const page = useTilesetEditorPageContext();
  return (
    <div className={mergeClasses(classes.root, "surface-translucent")}>
      {/* <button className={classes.back}>
        <BackIcon />
      </button> */}
      <EditableText tag="h1" value={page.tilesetName} onChange={page.setTilesetName} className={classes.title} />
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
        <button onClick={() => page.saveTilesetDocument()}>Save</button>
        <button onClick={() => page.loadTilesetDocument()}>Load</button>
      </div>
    </div>
  );
}
