import { useEffect, useState } from "react";
import { useTilesetEditor } from "../providers/TilesetEditorProvider";
import classes from "./TilesetEditor.module.css";

export function TilesetEditor() {
  const editor = useTilesetEditor();

  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);

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
