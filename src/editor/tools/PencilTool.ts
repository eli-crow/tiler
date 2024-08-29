import { RGBA } from "../model";
import { Tool } from "./Tool";

const TRANSPARENT: RGBA = [0, 0, 0, 0];

export type SupportsPencilTool = {
  setPixel(x: number, y: number, color: RGBA): void;
};

type ToolState =
  | { type: "idle" }
  | { type: "down"; downX: number; downY: number }
  | { type: "dragging"; lastMoveX: number; lastMoveY: number };

export class PencilTool extends Tool<SupportsPencilTool> {
  #state: ToolState = { type: "idle" };
  #color: RGBA = [255, 255, 255, 255];
  #erase = false;

  get color() {
    return this.#color;
  }

  set color(value: RGBA) {
    this.#color = value;
    this.notifyChanged();
  }

  get erase() {
    return this.#erase;
  }

  set erase(value: boolean) {
    this.#erase = value;
    this.notifyChanged();
  }

  private get resolvedColor() {
    return this.#erase ? TRANSPARENT : this.#color;
  }

  constructor(erase: boolean = false) {
    super();
    this.#erase = erase;
  }

  onPointerDown(x: number, y: number, event: PointerEvent) {
    if (event.button !== 0) {
      return;
    }
    if (this.#state.type === "idle") {
      this.tileset.setPixel(x, y, this.resolvedColor);
      this.#state = { type: "down", downX: x, downY: y };
      this.tileset.invalidate();
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

      this.tileset.setPixel(x, y, this.resolvedColor);

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

        this.tileset.setPixel(currentX, currentY, this.resolvedColor);
      }

      this.tileset.invalidate();

      this.#state.lastMoveX = currentX;
      this.#state.lastMoveY = currentY;
    }
  }

  onPointerUp(_x: number, _y: number, _event: PointerEvent) {
    this.#state = { type: "idle" };
  }
}
