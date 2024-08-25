import { RGBA } from "../../editor/model";
import { Swatch } from "./Swatch";
import classes from "./SwatchCollectionEditor.module.css";

interface SwatchCollectionEditorProps {
  onSelect: (colors: RGBA) => void;
}

const SWATCHES: readonly RGBA[] = [
  [34, 34, 34, 255], // Dark Gray
  [72, 61, 139, 255], // Dark Slate Blue
  [47, 79, 79, 255], // Dark Slate Gray
  [70, 130, 180, 255], // Steel Blue
  [95, 158, 160, 255], // Cadet Blue
  [60, 179, 113, 255], // Medium Sea Green
  [46, 139, 87, 255], // Sea Green
  [0, 128, 128, 255], // Teal
  [32, 178, 170, 255], // Light Sea Green
  [107, 142, 35, 255], // Olive Drab
  [85, 107, 47, 255], // Dark Olive Green
  [139, 69, 19, 255], // Saddle Brown
  [160, 82, 45, 255], // Sienna
  [178, 34, 34, 255], // Firebrick
  [220, 20, 60, 255], // Crimson
  [255, 99, 71, 255], // Tomato
  [233, 150, 122, 255], // Dark Salmon
  [255, 140, 0, 255], // Dark Orange
  [255, 165, 0, 255], // Orange
  [255, 215, 0, 255], // Gold
  [255, 255, 0, 255], // Yellow
  [154, 205, 50, 255], // Yellow Green
  [127, 255, 0, 255], // Chartreuse
  [173, 255, 47, 255], // Green Yellow
  [144, 238, 144, 255], // Light Green
  [102, 205, 170, 255], // Medium Aquamarine
  [72, 209, 204, 255], // Medium Turquoise
  [64, 224, 208, 255], // Turquoise
  [0, 255, 255, 255], // Cyan
  [0, 191, 255, 255], // Deep Sky Blue
  [135, 206, 250, 255], // Light Sky Blue
  [176, 196, 222, 255], // Light Steel Blue
  [106, 90, 205, 255], // Slate Blue
  [123, 104, 238, 255], // Medium Slate Blue
  [147, 112, 219, 255], // Medium Purple
  [199, 21, 133, 255], // Medium Violet Red
  [219, 112, 147, 255], // Pale Violet Red
  [255, 20, 147, 255], // Deep Pink
  [255, 105, 180, 255], // Hot Pink
  [255, 182, 193, 255], // Light Pink
];

export function SwatchCollectionEditor({ onSelect }: SwatchCollectionEditorProps) {
  return (
    <div className={classes.root}>
      <div className={classes.swatchGroup}>
        {SWATCHES.map((color, index) => (
          <Swatch key={index} color={color} onSelect={() => onSelect(color)} />
        ))}
      </div>
    </div>
  );
}
