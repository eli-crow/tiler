import { Tile } from "../model";
import { BaseTileset } from "../tileset/BaseTileset";
import { Tool } from "./Tool";

export type SupportsJigsawTileTool = {
  setTile(x: number, y: number, tile: Tile): void;
};

export function isSupportsJigsawTileTool(value: any): value is SupportsJigsawTileTool {
  return typeof value.setTile === "function";
}

type ToolState = { type: "idle" } | { type: "down" } | { type: "dragging" };

export class JigsawTileTool extends Tool<SupportsJigsawTileTool> {
  #state: ToolState = { type: "idle" };
  #tile: Tile = { x: 0, y: 0, corners: [] };

  get tile() {
    return this.#tile;
  }

  set tile(tile: Tile) {
    this.#tile = tile;
    this.notifyChanged();
  }

  supportsTileset<T extends BaseTileset>(tileset: T): tileset is T & SupportsJigsawTileTool {
    return isSupportsJigsawTileTool(tileset);
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
