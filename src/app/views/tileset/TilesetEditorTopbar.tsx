import EditableText from "@/app/components/EditableText";
import { IconButton } from "@/app/components/IconButton";
import BackIcon from "@/app/icons/back.svg?react";
import GuidesIcon from "@/app/icons/guides.svg?react";
import { useTilesetEditorPageContext } from "@/app/providers/TilesetEditorPageProvider";
import { mergeClasses } from "@/shared";
import classes from "./TilesetEditorTopbar.module.css";

interface TilesetEditorTopbarProps {
  backAction?: () => void;
}

export function TilesetEditorTopbar({ backAction }: TilesetEditorTopbarProps) {
  const page = useTilesetEditorPageContext();
  return (
    <div className={mergeClasses(classes.root, "surface-translucent")}>
      <button className={classes.back} onClick={backAction}>
        <BackIcon />
      </button>
      <EditableText tag="h1" value={page.tilesetName} onChange={page.setTilesetName} className={classes.title} />
      <div className={classes.modeGroup}>
        <button className={classes.mode} aria-current={page.mode === "raw"} onClick={() => page.setMode("raw")}>
          Tileset
        </button>
        <button className={classes.mode} aria-current={page.mode === "jigsaw"} onClick={() => page.setMode("jigsaw")}>
          Combos
        </button>
        <button className={classes.mode} aria-current={page.mode === "terrain"} onClick={() => page.setMode("terrain")}>
          Playground
        </button>
        <IconButton
          role="switch"
          aria-checked={page.showTileGuides}
          onClick={() => page.setShowTileGuides(!page.showTileGuides)}
        >
          <GuidesIcon />
        </IconButton>
        <button onClick={() => page.saveTilesetDocument()}>Save</button>
      </div>
    </div>
  );
}
