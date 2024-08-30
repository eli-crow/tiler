import { RGBA } from "../model";
import { BaseTileset } from "../tileset/BaseTileset";
import { Tool } from "./Tool";

export type SupportsFillTool = {
  setPixel(x: number, y: number, color: RGBA): void;
  getPixel(x: number, y: number): RGBA;
};

function isSupportsFillTool(value: any): value is SupportsFillTool {
  return typeof value.setPixel === "function";
}

export class FillTool extends Tool<SupportsFillTool> {
  supportsTileset<T extends BaseTileset>(tileset: T): tileset is T & SupportsFillTool {
    return isSupportsFillTool(tileset);
  }

  onPointerUp(x: number, y: number, event: PointerEvent) {
    if (event.button !== 0) {
      return;
    }

    const tileset = this.tileset;
    const color = this.editor.color;
    const targetColor = tileset.getPixel(x, y);
    if (
      color[0] === targetColor[0] &&
      color[1] === targetColor[1] &&
      color[2] === targetColor[2] &&
      color[3] === targetColor[3]
    ) {
      return;
    }
    const stack: [number, number][] = [[x, y]];
    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      if (x < 0 || y < 0 || x >= tileset.width || y >= tileset.height) {
        continue;
      }
      const currentColor = tileset.getPixel(x, y);
      if (
        currentColor[0] !== targetColor[0] ||
        currentColor[1] !== targetColor[1] ||
        currentColor[2] !== targetColor[2] ||
        currentColor[3] !== targetColor[3]
      ) {
        continue;
      }
      tileset.setPixel(x, y, color);
      stack.push([x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]);
    }
    tileset.invalidate();
  }
}
