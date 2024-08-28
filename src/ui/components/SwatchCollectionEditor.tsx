import { useEffect, useState } from "react";
import { RGBA } from "../../editor/model";
import { useTileset } from "../providers/TilesetProvider";
import { Swatch } from "./Swatch";
import classes from "./SwatchCollectionEditor.module.css";

interface SwatchCollectionEditorProps {
  onSelect: (colors: RGBA) => void;
}

export function SwatchCollectionEditor({ onSelect }: SwatchCollectionEditorProps) {
  const tileset = useTileset();

  const [uniqueColors, setUniqueColors] = useState<RGBA[]>(tileset.getUniqueColors());

  useEffect(() => {
    tileset.once("dataChanged", () => {
      setUniqueColors(tileset.getUniqueColors());
    });
  }, [tileset]);

  return (
    <div className={classes.root}>
      <div className={classes.swatchGroup}>
        {uniqueColors.map((color, index) => (
          <Swatch key={index} color={color} onSelect={() => onSelect(color)} />
        ))}
      </div>
      <button onClick={() => setUniqueColors(tileset.getUniqueColors())}>🔄</button>
    </div>
  );
}
