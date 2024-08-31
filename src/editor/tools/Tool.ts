import { EventEmitter } from "../events/EventEmitter";
import { BaseTileset } from "../tileset/BaseTileset";
import { TilesetEditor } from "../TilesetEditor";

let __toolIds = 0;

interface ToolEvents {
  changed(): void;
}

export abstract class Tool<Requirements = object> {
  #emitter = new EventEmitter<ToolEvents>();
  tileset: BaseTileset & Requirements = null!;
  editor: TilesetEditor = null!;

  readonly id = __toolIds++;
  onPointerDown(_x: number, _y: number, _e: MouseEvent) {}
  onPointerMove(_x: number, _y: number, _e: MouseEvent) {}
  onPointerUp(_x: number, _y: number, _e: MouseEvent) {}
  readonly on: EventEmitter<ToolEvents>["on"] = this.#emitter.on.bind(this.#emitter);
  readonly once: EventEmitter<ToolEvents>["once"] = this.#emitter.once.bind(this.#emitter);
  readonly off: EventEmitter<ToolEvents>["off"] = this.#emitter.off.bind(this.#emitter);
  protected readonly emit: EventEmitter<ToolEvents>["emit"] = this.#emitter.emit.bind(this.#emitter);

  protected notifyChanged() {
    this.#emitter.emit("changed");
  }

  abstract supportsTileset<T extends BaseTileset>(tileset: T): tileset is T & Requirements;
}
