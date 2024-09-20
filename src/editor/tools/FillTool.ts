import { colorsMatch, RGBA } from "../model";
import { BaseTileset } from "../tileset/BaseTileset";
import { Tool } from "./Tool";

export type SupportsFillTool = {
  setBufferPixel(x: number, y: number, color: RGBA): void;
  getPixel(x: number, y: number): RGBA;
};

function isSupportsFillTool(value: any): value is SupportsFillTool {
  return typeof value.setBufferPixel === "function" && typeof value.getPixel === "function";
}

export class FillTool extends Tool<SupportsFillTool> {
  supportsTileset<T extends BaseTileset>(tileset: T): tileset is T & SupportsFillTool {
    return isSupportsFillTool(tileset);
  }

  onPointerUp(x: number, y: number, event: PointerEvent) {
    if (event.button !== 0) return;

    const tileset = this.tileset;
    const { width, height } = tileset;

    const color = this.editor.color;
    const targetColor = tileset.getPixel(x, y);

    if (colorsMatch(color, targetColor)) return;

    const stack: [number, number][] = [[x, y]];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      visited.add(key);

      if (x < 0 || y < 0 || x >= width || y >= height) continue;

      const currentColor = tileset.getPixel(x, y);
      if (!colorsMatch(currentColor, targetColor)) continue;

      tileset.setBufferPixel(x, y, color);
      stack.push([x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]);
    }

    tileset.invalidate();

    tileset.flushBuffer();
  }
}
