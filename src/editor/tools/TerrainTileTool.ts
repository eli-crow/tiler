import { Tool } from "./Tool";

export type SupportsTerrainTileTool = {
  setTile(x: number, y: number, tile: boolean): void;
};

type ToolState = { type: "idle" } | { type: "down" } | { type: "dragging" };

export class TerrainTileTool extends Tool<SupportsTerrainTileTool> {
  #state: ToolState = { type: "idle" };

  onPointerDown(x: number, y: number, event: PointerEvent) {
    if (event.button !== 0) {
      return;
    }

    if (this.#state.type === "idle") {
      const shouldErase = event.shiftKey;
      const position = this.tileset.getTilePositionAtPixel(x, y);
      if (!position) {
        return;
      }
      this.tileset.setTile(position.x, position.y, !shouldErase);
      this.tileset.invalidate();
      this.#state = { type: "down" };
    }
  }

  onPointerMove(x: number, y: number, event: PointerEvent) {
    if (this.#state.type === "idle") {
      return;
    }

    if (this.#state.type === "down") {
      this.#state = { type: "dragging" };
    }

    if (this.#state.type === "dragging") {
      const shouldErase = event.shiftKey;
      const position = this.tileset.getTilePositionAtPixel(x, y);
      if (!position) {
        return;
      }
      this.tileset.setTile(position.x, position.y, !shouldErase);
      this.tileset.invalidate();
    }
  }

  onPointerUp(_x: number, _y: number, _event: PointerEvent) {
    this.#state = { type: "idle" };
  }
}
