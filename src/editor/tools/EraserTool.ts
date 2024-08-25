import { RGBA } from "../model";
import { Tool } from "./Tool";

export type SupportsEraserTool = {
  setPixel(x: number, y: number, color: RGBA): void;
  get tool(): Tool;
  set tool(tool: EraserTool);
};

type ToolState =
  | { type: "idle" }
  | { type: "down"; downX: number; downY: number }
  | { type: "dragging"; lastMoveX: number; lastMoveY: number };

export class EraserTool extends Tool {
  #state: ToolState = { type: "idle" };
  #color: RGBA = [0, 0, 0, 0];

  onPointerDown(x: number, y: number, event: PointerEvent) {
    if (event.button !== 0) {
      return;
    }
    if (this.#state.type === "idle") {
      this.editor.setPixel(x, y, this.#color);
      this.#state = { type: "down", downX: x, downY: y };
    }
  }

  onPointerMove(x: number, y: number, _event: PointerEvent) {
    if (this.#state.type === "idle") {
      return;
    }

    if (this.#state.type === "down") {
      this.#state = { type: "dragging", lastMoveX: x, lastMoveY: y };
    }

    if (this.#state.type === "dragging") {
      const { lastMoveX, lastMoveY } = this.#state;
      let currentX = lastMoveX;
      let currentY = lastMoveY;
      while (true) {
        const deltaX = x - currentX;
        const deltaY = y - currentY;
        const distance = deltaX ** 2 + deltaY ** 2;
        if (distance < 1) {
          break;
        }

        currentX += deltaX / distance;
        currentY += deltaY / distance;
        this.editor.setPixel(currentX, currentY, this.#color);
      }

      this.#state.lastMoveX = currentX;
      this.#state.lastMoveY = currentY;
    }
  }

  onPointerUp(_x: number, _y: number, _event: PointerEvent) {
    this.#state = { type: "idle" };
  }
}
