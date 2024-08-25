import { EventEmitter } from "../events/EventEmitter";
import { BaseTileset } from "../tileset/BaseTileset";

interface ToolEvents {
  changed(): void;
}

export class Tool<Requirements = object> {
  #emitter = new EventEmitter<ToolEvents>();
  tileset: BaseTileset & Requirements = null!;

  onPointerDown(_x: number, _y: number, _e: PointerEvent) {}
  onPointerMove(_x: number, _y: number, _e: PointerEvent) {}
  onPointerUp(_x: number, _y: number, _e: PointerEvent) {}
  on: EventEmitter<ToolEvents>["on"] = this.#emitter.on.bind(this.#emitter);
  off: EventEmitter<ToolEvents>["off"] = this.#emitter.off.bind(this.#emitter);

  protected notifyChanged() {
    this.#emitter.emit("changed");
  }
}
