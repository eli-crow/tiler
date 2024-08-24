import { RGBA } from "../model";
import { Tool } from "./Tool";

type ToolState =
  | { type: "idle" }
  | { type: "down"; downX: number; downY: number }
  | { type: "dragging"; lastMoveX: number; lastMoveY: number };

export class PencilTool extends Tool {
  #state: ToolState = { type: "idle" };
  #color: RGBA = { r: 255, g: 255, b: 255, a: 255 };

  get color() {
    return this.#color;
  }

  set color(value: RGBA) {
    this.#color = value;
    this.notifyChanged();
  }

  onPointerDown(x: number, y: number) {
    if (this.#state.type === "idle") {
      this.editor.setPixel(x, y, this.#color);
      this.#state = { type: "down", downX: x, downY: y };
    }
  }

  onPointerMove(x: number, y: number) {
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

  onPointerUp(_x: number, _y: number) {
    this.#state = { type: "idle" };
  }
}
