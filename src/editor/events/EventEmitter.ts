export class EventEmitter<TEvents extends { [Key in keyof TEvents]: (...args: any) => void }> {
  #listeners: { [K in keyof TEvents]?: Set<TEvents[K]> } = {};

  on<T extends keyof TEvents>(event: T, listener: TEvents[T]) {
    let listeners = this.#listeners[event];
    if (!listeners) {
      listeners = new Set();
      this.#listeners[event] = listeners;
    }
    listeners.add(listener);
  }

  once<T extends keyof TEvents>(event: T, listener: TEvents[T]) {
    const onceListener = (...args: Parameters<TEvents[T]>) => {
      this.off(event, onceListener as TEvents[T]);
      listener(...args);
    };
    this.on(event, onceListener as TEvents[T]);
  }

  off<T extends keyof TEvents>(event: T, listener: TEvents[T]) {
    const listeners = this.#listeners[event];
    if (listeners) {
      listeners.delete(listener);
    }
  }

  emit<T extends keyof TEvents>(event: T, ...args: Parameters<TEvents[T]>) {
    const listeners = this.#listeners[event];
    if (listeners) {
      for (const listener of listeners) {
        listener(...args);
      }
    }
  }
}
