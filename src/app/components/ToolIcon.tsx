import { CombosTileTool, FillTool, PencilTool, TerrainTileTool, Tool } from "@/editor";

import ToolIconCombos from "@/app/icons/tool-Combos-tile.svg?react";
import ToolIconEraser from "@/app/icons/tool-eraser.svg?react";
import ToolIconFill from "@/app/icons/tool-fill.svg?react";
import ToolIconPencil from "@/app/icons/tool-pencil.svg?react";
import ToolIconTerrain from "@/app/icons/tool-terrain-tile.svg?react";

interface ToolIconProps {
  tool: Tool;
}

export function ToolIcon({ tool }: ToolIconProps) {
  if (tool instanceof PencilTool) {
    return tool.erase ? <ToolIconEraser /> : <ToolIconPencil />;
  } else if (tool instanceof FillTool) {
    return <ToolIconFill />;
  } else if (tool instanceof CombosTileTool) {
    return <ToolIconCombos />;
  } else if (tool instanceof TerrainTileTool) {
    return <ToolIconTerrain />;
  } else {
    return <ToolIconEraser />;
  }
}
