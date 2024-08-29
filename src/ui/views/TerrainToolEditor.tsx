import { Tileset4x4PlusTerrain } from "../../editor/tileset/Tileset4x4PlusTerrain";
import { TerrainTileTool } from "../../editor/tools/TerrainTileTool";
import RandomizeIcon from "../icons/randomize.svg?react";
import { useTilesetEditor } from "../providers/TilesetEditorProvider";
import classes from "./TerrainToolEditor.module.css";

interface TerrainToolEditor {
  tool: TerrainTileTool;
}

export function TerrainToolEditor({ tool }: TerrainToolEditor) {
  const editor = useTilesetEditor();

  function randomize(): void {
    if (editor.tileset instanceof Tileset4x4PlusTerrain) {
      editor.tileset.randomize();
      editor.tileset.invalidate();
    }
  }

  return (
    <div className={classes.root}>
      <button onClick={randomize}>
        <RandomizeIcon />
      </button>
    </div>
  );
}
