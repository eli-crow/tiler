import { clamp } from "@/shared";
import { RGBA, TRANSPARENT } from "../model";
import { BaseTileset } from "../tileset/BaseTileset";
import { Tool } from "./Tool";

const DIAMETER_MIN = 1;
const DIAMETER_MAX = 100;
const FILL_DELAY_MS = 1_500;

export type SupportsPencilTool = {
  setBufferPixel(x: number, y: number, color: RGBA): void;
};

function isSupportsPencilTool(value: any): value is SupportsPencilTool {
  return typeof value.setBufferPixel === "function";
}

type ToolState =
  | {
      type: "idle";
    }
  | {
      type: "down";
      downX: number;
      downY: number;
    }
  | {
      type: "dragging";
      downX: number;
      downY: number;
      lastMoveX: number;
      lastMoveY: number;
      path: number[];
      timerId?: number;
    };

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
    const state = this.#state;

    if (state.type === "idle") {
      return;
    }

    if (state.type === "down") {
      this.#state = {
        type: "dragging",
        downX: state.downX,
        downY: state.downY,
        lastMoveX: x,
        lastMoveY: y,
        path: [x, y],
      };
    }

    if (state.type === "dragging") {
      const { lastMoveX, lastMoveY } = state;
      let currentX = lastMoveX;
      let currentY = lastMoveY;
      while (true) {
        const deltaX = x - currentX;
        const deltaY = y - currentY;

        const distance = deltaX ** 2 + deltaY ** 2;
        if (distance < 1) break;

        currentX += deltaX / distance;
        currentY += deltaY / distance;

        state.path.push(currentX, currentY);
        this.#drawCircle(currentX, currentY);
      }

      state.path.push(x, y);
      this.#drawCircle(x, y);

      this.tileset.invalidate();

      state.lastMoveX = currentX;
      state.lastMoveY = currentY;

      // TODO: this should really depend on screenspace distance, since it is meant to represent the user no longer moving the pointer, with some tolerance
      if (this.#pointsApproximatelyEqual(x, y, lastMoveX, lastMoveY)) {
        state.timerId = window.setTimeout(() => {
          this.#fillPolygon(state.path);
          this.tileset.invalidate();
          this.tileset.flushBuffer();
          this.#state = { type: "idle" };
        }, FILL_DELAY_MS);
      } else {
        window.clearTimeout(state.timerId);
      }
    }
  }

  onPointerUp(_x: number, _y: number, _event: PointerEvent) {
    this.#state = { type: "idle" };
    this.tileset.flushBuffer();
  }

  #pointsApproximatelyEqual(x1: number, y1: number, x2: number, y2: number) {
    return (x2 - x1) ** 2 + (y2 - y1) ** 2 < 1;
  }

  #drawCircle(cx: number, cy: number) {
    const color = this.erase ? TRANSPARENT : this.editor.color;

    if (this.diameter === 1) {
      this.tileset.setBufferPixel(cx, cy, color);
      return;
    }

    const radius = this.diameter / 2;
    const sqRadius = radius ** 2;

    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        if (x ** 2 + y ** 2 <= sqRadius) {
          this.tileset.setBufferPixel(cx + x, cy + y, color);
        }
      }
    }
  }

  #isPointInPolygon(x: number, y: number, points: readonly number[]): boolean {
    let inside = false;
    for (let i = 2, j = points.length - 2; i < points.length; j = i, i += 2) {
      const x1 = points[j];
      const y1 = points[j + 1];
      const x2 = points[i];
      const y2 = points[i + 1];
      if ((y1 <= y && y < y2) || (y2 <= y && y < y1)) {
        const t = (y - y1) / (y2 - y1);
        if (x + 0.5 < x1 + t * (x2 - x1)) {
          inside = !inside;
        }
      }
    }
    return inside;
  }

  #fillPolygon(points: readonly number[]) {
    const color = this.erase ? TRANSPARENT : this.editor.color;
    const { width, height } = this.tileset;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (this.#isPointInPolygon(x, y, points)) {
          this.tileset.setBufferPixel(x, y, color);
        }
      }
    }
  }
}
