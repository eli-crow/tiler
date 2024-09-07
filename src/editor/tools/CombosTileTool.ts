import { Tile4x4PlusCombos, TilePosition } from "../model";
import { BaseTileset } from "../tileset/BaseTileset";
import { Tool } from "./Tool";

export type SupportsCombosTileTool = {
  setTile(position: TilePosition, tile: Tile4x4PlusCombos): void;
};

function isSupportsCombosTileTool(value: any): value is SupportsCombosTileTool {
  return typeof value.setTile === "function";
}

type ToolState = { type: "idle" } | { type: "down" } | { type: "dragging" };

export class CombosTileTool extends Tool<SupportsCombosTileTool> {
  #state: ToolState = { type: "idle" };
  #tile: Tile4x4PlusCombos = { sourcePosition: { x: 0, y: 0 }, innerCorners: [] };

  get tile() {
    return this.#tile;
  }

  set tile(tile: Tile4x4PlusCombos) {
    this.#tile = tile;
    this.notifyChanged();
  }

  supportsTileset<T extends BaseTileset>(tileset: T): tileset is T & SupportsCombosTileTool {
    return isSupportsCombosTileTool(tileset);
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
      this.tileset.setTile(position, this.tile);
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
      this.tileset.setTile(position, this.tile);
      this.tileset.invalidate();
    }
  }

  onPointerUp(_x: number, _y: number) {
    this.#state = { type: "idle" };
  }
}
