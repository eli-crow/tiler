import debounce from "debounce";
import { useEffect, useState } from "react";
import { RGBA } from "../../editor/model";
import { useTileset } from "../providers/TilesetProvider";
import { Swatch } from "./Swatch";
import classes from "./SwatchCollectionEditor.module.css";

const GET_COLORS_DEBOUNCE_MS = 150;

interface SwatchCollectionEditorProps {
  onSelect: (colors: RGBA) => void;
}

export function SwatchCollectionEditor({ onSelect }: SwatchCollectionEditorProps) {
  const tileset = useTileset();

  const [uniqueColors, setUniqueColors] = useState(tileset.getUniqueColors());

  useEffect(() => {
    const handleDataChanged = debounce(() => {
      setUniqueColors(tileset.getUniqueColors());
    }, GET_COLORS_DEBOUNCE_MS);
    tileset.on("dataChanged", handleDataChanged);
    return () => {
      tileset.off("dataChanged", handleDataChanged);
    };
  }, [tileset]);

  return (
    <div className={classes.root}>
      <div className={classes.swatchGroup}>
        {uniqueColors.map(([color], index) => (
          <Swatch key={index} color={color} onSelect={() => onSelect(color)} />
        ))}
      </div>
    </div>
  );
}
