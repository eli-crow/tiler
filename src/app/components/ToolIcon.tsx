import { FillTool } from "../../editor/tools/FillTool";
import { JigsawTileTool } from "../../editor/tools/JigsawTileTool";
import { PencilTool } from "../../editor/tools/PencilTool";
import { TerrainTileTool } from "../../editor/tools/TerrainTileTool";
import { Tool } from "../../editor/tools/Tool";

import ToolIconEraser from "../icons/tool-eraser.svg?react";
import ToolIconFill from "../icons/tool-fill.svg?react";
import ToolIconJigsaw from "../icons/tool-jigsaw-tile.svg?react";
import ToolIconPencil from "../icons/tool-pencil.svg?react";
import ToolIconTerrain from "../icons/tool-terrain-tile.svg?react";

interface ToolIconProps {
  tool: Tool;
}

export function ToolIcon({ tool }: ToolIconProps) {
  if (tool instanceof PencilTool) {
    return tool.erase ? <ToolIconEraser /> : <ToolIconPencil />;
  } else if (tool instanceof FillTool) {
    return <ToolIconFill />;
  } else if (tool instanceof JigsawTileTool) {
    return <ToolIconJigsaw />;
  } else if (tool instanceof TerrainTileTool) {
    return <ToolIconTerrain />;
  } else {
    return <ToolIconEraser />;
  }
}
