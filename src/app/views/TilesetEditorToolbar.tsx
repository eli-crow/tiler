import { ToolIcon } from "@/app/components/ToolIcon";
import { useTilesetEditorPageContext } from "@/app/providers/TilesetEditorPageProvider";
import { mergeClasses } from "@/shared";
import classes from "./TilesetEditorToolbar.module.css";

export function TilesetEditorToolbar() {
  const page = useTilesetEditorPageContext();
  return (
    <div className={mergeClasses(classes.root, "surface-translucent")}>
      <div className={classes.toolGroup}>
        {page.supportedTools.map((tool) => (
          <button
            className={classes.tool}
            data-active={page.tool === tool}
            onClick={() => page.setTool(tool)}
            key={tool.id}
          >
            <ToolIcon tool={tool} />
          </button>
        ))}
      </div>
    </div>
  );
}
