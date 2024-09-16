import { ColorPicker } from "@/app/components/ColorPicker";
import { SwatchCollectionEditor } from "@/app/components/SwatchCollectionEditor";
import { useTilesetEditorContext } from "@/app/providers/TilesetEditorProvider";
import { mergeClasses } from "@/shared";
import classes from "./TilesetEditorToolSettings.module.css";

export function TilesetEditorToolSettings() {
  const page = useTilesetEditorContext();

  return (
    <div className={mergeClasses(classes.root, "surface-translucent")}>
      <ColorPicker color={page.color} onChange={page.setColor} />
      <SwatchCollectionEditor onSelect={page.setColor} />
    </div>
  );
}
