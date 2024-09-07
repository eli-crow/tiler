import { IconButton } from "@/app/components/IconButton";
import { Topbar } from "@/app/components/Topbar";
import GuidesIcon from "@/app/icons/guides.svg?react";
import { useTilesetEditorPageContext } from "@/app/providers/TilesetEditorPageProvider";
import classes from "./TilesetEditorTopbar.module.css";

interface TilesetEditorTopbarProps {
  backAction?: () => void;
}

export function TilesetEditorTopbar({ backAction }: TilesetEditorTopbarProps) {
  const page = useTilesetEditorPageContext();

  return (
    <Topbar title={page.tilesetName} setTitle={page.setTilesetName} backAction={backAction}>
      <div className={classes.modeGroup}>
        <button className={classes.mode} aria-current={page.mode === "raw"} onClick={() => page.setMode("raw")}>
          Tileset
        </button>
        <button className={classes.mode} aria-current={page.mode === "Combos"} onClick={() => page.setMode("Combos")}>
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
    </Topbar>
  );
}
