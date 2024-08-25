import { Tile } from "../model";
import { Tool } from "./Tool";

export type SupportsTileTool = {
  setTile(x: number, y: number, tile: Tile): void;
  get tool(): Tool;
  set tool(tool: TileTool);
};

type ToolState = { type: "idle" } | { type: "down" } | { type: "dragging" };

export class TileTool extends Tool<SupportsTileTool> {
  #state: ToolState = { type: "idle" };
  #tile: Tile = { x: 0, y: 0, corners: [] };

  get tile() {
    return this.#tile;
  }

  set tile(tile: Tile) {
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
      this.tileset.setTile(position.x, position.x, this.tile);
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
    }
  }

  onPointerUp(_x: number, _y: number) {
    this.#state = { type: "idle" };
  }
}
