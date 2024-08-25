import { Tile } from "../model";
import { Tool } from "./Tool";

export type SupportsTileTool = {
  setTile(x: number, y: number, tile: Tile): void;
  get tool(): Tool;
  set tool(tool: TileTool);
};

type ToolState = { type: "idle" } | { type: "down" } | { type: "dragging" };

export class TileTool extends Tool {
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
      const { x: tileX, y: tileY } = this.editor.getTileLocationAtPoint(x, y);
      this.editor.setTile(tileX, tileY, this.tile);
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
      const { x: tileX, y: tileY } = this.editor.getTileLocationAtPoint(x, y);
      this.editor.setTile(tileX, tileY, this.tile);
    }
  }

  onPointerUp(_x: number, _y: number) {
    this.#state = { type: "idle" };
  }
}
