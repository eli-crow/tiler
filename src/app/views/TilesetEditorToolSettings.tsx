import { mergeClasses } from "../../shared";
import { ColorPicker } from "../components/ColorPicker";
import { SwatchCollectionEditor } from "../components/SwatchCollectionEditor";
import { useTilesetEditorPageContext } from "../providers/TilesetEditorPageProvider";
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
