import { IconButton } from "@/app/components/IconButton";
import { Topbar } from "@/app/components/Topbar";
import GuidesIcon from "@/app/icons/guides.svg?react";
import { useTilesetDocumentContext } from "@/app/providers/TilesetDocumentProvider";
import { useTilesetEditorContext } from "@/app/providers/TilesetEditorProvider";
import { useTilesetsContext } from "@/app/providers/TilesetsProvider";
import classes from "./TilesetEditorTopbar.module.css";

interface TilesetEditorTopbarProps {
  backAction?: () => void;
}

export function TilesetEditorTopbar({ backAction }: TilesetEditorTopbarProps) {
  const doc = useTilesetDocumentContext();
  const editor = useTilesetEditorContext();
  const tilesets = useTilesetsContext();

  return (
    <Topbar title={doc.tilesetName} setTitle={doc.setTilesetName} backAction={backAction}>
      <div className={classes.modeGroup}>
        {tilesets.tilesetOptions.map((option) => (
          <button
            key={option.index}
            className={classes.mode}
            aria-current={option.isSelected}
            onClick={() => tilesets.setTilesetIndex(option.index)}
          >
            {option.name}
          </button>
        ))}
        <IconButton
          role="switch"
          aria-checked={editor.showTileGuides}
          onClick={() => editor.setShowTileGuides(!editor.showTileGuides)}
        >
          <GuidesIcon />
        </IconButton>
        <button onClick={() => doc.saveImageData(tilesets.tileset.getSourceImageData())}>Save</button>
        <button onClick={() => doc.convertToCombos()}>To Combos</button>
      </div>
    </Topbar>
  );
}
