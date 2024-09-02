import { IconButton } from "@/app/components/IconButton";
import MinusIcon from "@/app/icons/minus.svg?react";
import PlusIcon from "@/app/icons/plus.svg?react";
import { useActiveTool } from "@/app/providers/TilesetEditorPageProvider";
import { PencilTool } from "@/editor";

export function PencilEditor() {
  const tool = useActiveTool<PencilTool>();
  return (
    <>
      <IconButton onClick={() => (tool.diameter += 1)}>
        <PlusIcon />
      </IconButton>

      <IconButton>{tool.diameter}</IconButton>

      <IconButton onClick={() => (tool.diameter -= 1)}>
        <MinusIcon />
      </IconButton>
    </>
  );
}
