import { EventEmitter } from "../events/EventEmitter";
import { TilesetEditor } from "../TilesetEditor";

interface ToolEvents {
  changed(): void;
}

export class Tool {
  protected editor: TilesetEditor;

  #emitter = new EventEmitter<ToolEvents>();

  onPointerDown(_x: number, _y: number) {}
  onPointerMove(_x: number, _y: number) {}
  onPointerUp(_x: number, _y: number) {}

  constructor(editor: TilesetEditor) {
    this.editor = editor;
  }

  on: EventEmitter<ToolEvents>["on"] = this.#emitter.on.bind(this.#emitter);
  off: EventEmitter<ToolEvents>["off"] = this.#emitter.off.bind(this.#emitter);

  protected notifyChanged() {
    this.#emitter.emit("changed");
  }
}
