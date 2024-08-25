import { useEffect, useState } from "react";
import { usePasteImageSourceCallback } from "../hooks/usePasteImage";
import { useTilesetEditor } from "../providers/TilesetEditorProvider";
import classes from "./TilesetEditorView.module.css";

export function TilesetEditorView() {
  const editor = useTilesetEditor();

  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);

  usePasteImageSourceCallback((imageSource) => {
    editor.tileset.setFromImageSource(imageSource);
    editor.tileset.invalidate();
  });

  useEffect(() => {
    if (containerEl && editor) {
      editor.mount(containerEl);
      return () => {
        editor.unmount();
      };
    }
  }, [containerEl, editor]);

  return <div ref={setContainerEl} className={classes.root} />;
}
