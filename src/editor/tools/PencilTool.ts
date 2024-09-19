import { clamp } from "@/shared";
import { RGBA } from "../model";
import { BaseTileset } from "../tileset/BaseTileset";
import { Tool } from "./Tool";

const TRANSPARENT: RGBA = [0, 0, 0, 0];
const DIAMETER_MIN = 1;
const DIAMETER_MAX = 100;

export type SupportsPencilTool = {
  setBufferPixel(x: number, y: number, color: RGBA): void;
};

function isSupportsPencilTool(value: any): value is SupportsPencilTool {
  return typeof value.setBufferPixel === "function";
}

type ToolState =
  | { type: "idle" }
  | { type: "down"; downX: number; downY: number }
  | { type: "dragging"; lastMoveX: number; lastMoveY: number };

export class PencilTool extends Tool<SupportsPencilTool> {
  #state: ToolState = { type: "idle" };
  #erase = false;
  #diameter = 1;

  get erase() {
    return this.#erase;
  }

  set erase(value: boolean) {
    this.#erase = value;
    this.notifyChanged();
  }

  private get resolvedColor() {
    return this.#erase ? TRANSPARENT : this.editor.color;
  }

  get diameter() {
    return this.#diameter;
  }
  set diameter(value: number) {
    this.#diameter = clamp(value, DIAMETER_MIN, DIAMETER_MAX);
    this.notifyChanged();
  }

  constructor(erase: boolean = false) {
    super();
    this.#erase = erase;
  }

  supportsTileset<T extends BaseTileset>(tileset: T): tileset is T & SupportsPencilTool {
    return isSupportsPencilTool(tileset);
  }

  onPointerDown(x: number, y: number, event: PointerEvent) {
    if (event.button !== 0) {
      return;
    }
    if (this.#state.type === "idle") {
      this.#drawCircle(x, y);
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

      this.#drawCircle(lastMoveX, lastMoveY);

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

        this.#drawCircle(currentX, currentY);
      }

      this.tileset.invalidate();

      this.#state.lastMoveX = currentX;
      this.#state.lastMoveY = currentY;
    }
  }

  onPointerUp(_x: number, _y: number, _event: PointerEvent) {
    this.#state = { type: "idle" };
    this.tileset.flushBuffer();
  }

  #drawCircle(cx: number, cy: number) {
    if (this.diameter === 1) {
      this.tileset.setBufferPixel(cx, cy, this.resolvedColor);
      return;
    }

    const radius = this.diameter / 2;
    const sqRadius = radius ** 2;

    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        if (x ** 2 + y ** 2 <= sqRadius) {
          this.tileset.setBufferPixel(cx + x, cy + y, this.resolvedColor);
        }
      }
    }
  }
}
