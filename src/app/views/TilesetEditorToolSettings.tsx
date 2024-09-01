import { ColorPicker } from "@/app/components/ColorPicker";
import { SwatchCollectionEditor } from "@/app/components/SwatchCollectionEditor";
import { useTilesetEditorPageContext } from "@/app/providers/TilesetEditorPageProvider";
import { mergeClasses } from "@/shared";
import classes from "./TilesetEditorToolSettings.module.css";

export function TilesetEditorToolSettings() {
  const page = useTilesetEditorPageContext();

  return (
    <div className={mergeClasses(classes.root, "surface-translucent")}>
      <ColorPicker color={page.color} onChange={page.setColor} />
      <SwatchCollectionEditor onSelect={page.setColor} />
    </div>
  );
}
