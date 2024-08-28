import { JigsawTile } from "../model";
import { Tool } from "./Tool";

export type SupportsJigsawTileTool = {
  setTile(x: number, y: number, tile: JigsawTile): void;
};

type ToolState = { type: "idle" } | { type: "down" } | { type: "dragging" };

export class JigsawTileTool extends Tool<SupportsJigsawTileTool> {
  #state: ToolState = { type: "idle" };
  #tile: JigsawTile = { x: 0, y: 0, corners: [] };

  get tile() {
    return this.#tile;
  }

  set tile(tile: JigsawTile) {
    this.#tile = tile;
    this.notifyChanged();
  }

  onPointerDown(x: number, y: number, event: PointerEvent) {
    if (event.button !== 0) {
      return;
    }

    if (this.#state.type === "idle") {
      const position = this.tileset.getTilePositionAtPixel(x, y);
      if (!position) {
        return;
      }
      this.tileset.setTile(position.x, position.y, this.tile);
      this.tileset.invalidate();
      this.#state = { type: "down" };
    }
  }

  onPointerMove(x: number, y: number) {
    if (this.#state.type === "idle") {
      return;
    }

    if (this.#state.type === "down") {
      this.#state = { type: "dragging" };
    }

    if (this.#state.type === "dragging") {
      const position = this.tileset.getTilePositionAtPixel(x, y);
      if (!position) {
        return;
      }
      this.tileset.setTile(position.x, position.y, this.tile);
      this.tileset.invalidate();
    }
  }

  onPointerUp(_x: number, _y: number) {
    this.#state = { type: "idle" };
  }
}
