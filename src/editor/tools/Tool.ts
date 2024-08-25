import { EventEmitter } from "../events/EventEmitter";
import { TilesetEditor } from "../TilesetEditor";

interface ToolEvents {
  changed(): void;
}

export class Tool {
  protected editor: TilesetEditor;

  #emitter = new EventEmitter<ToolEvents>();

  onPointerDown(_x: number, _y: number, _e: PointerEvent) {}
  onPointerMove(_x: number, _y: number, _e: PointerEvent) {}
  onPointerUp(_x: number, _y: number, _e: PointerEvent) {}

  constructor(editor: TilesetEditor) {
    this.editor = editor;
  }

  on: EventEmitter<ToolEvents>["on"] = this.#emitter.on.bind(this.#emitter);
  off: EventEmitter<ToolEvents>["off"] = this.#emitter.off.bind(this.#emitter);

  protected notifyChanged() {
    this.#emitter.emit("changed");
  }
}
