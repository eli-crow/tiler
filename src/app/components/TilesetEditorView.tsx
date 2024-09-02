import { usePasteImageSourceCallback } from "@/app/hooks/usePasteImage";
import { useTilesetEditor } from "@/app/providers/TilesetEditorPageProvider";
import { TilesetEditor } from "@/editor";
import { useEffect, useState } from "react";
import classes from "./TilesetEditorView.module.css";

type TilesetEditorViewProps = {
  editor?: TilesetEditor;
};

export function TilesetEditorView({ editor }: TilesetEditorViewProps) {
  editor = editor ?? useTilesetEditor();

  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);

  usePasteImageSourceCallback((imageSource) => {
    editor.tileset.setSourceDataFromImageSource(imageSource);
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
      let action: (() => void) | null = null;
      if ((e.metaKey || e.ctrlKey) && e.key === "c") {
        action = editor.copyToClipboard;
      } else if (
        ((e.metaKey || e.ctrlKey) && e.key === "y") ||
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "z")
      ) {
        action = editor.redo;
      } else if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        action = editor.undo;
        editor.undo();
      }

      if (action) {
        e.preventDefault();
        e.stopPropagation();
        action();
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
