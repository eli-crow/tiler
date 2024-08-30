import { useEffect, useState } from "react";
import { usePasteImageSourceCallback } from "../hooks/usePasteImage";
import { useTilesetEditor } from "../providers/TilesetEditorPageProvider";
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "c") {
        e.preventDefault();
        e.stopPropagation();
        editor.copyToClipboard();
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, []);

  return (
    <div className={classes.root}>
      <div ref={setContainerEl} className={classes.container}></div>
    </div>
  );
}
