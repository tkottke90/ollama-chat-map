
type KeyboardHandlerFn = <TEvent extends KeyboardEvent> (event: TEvent) => void

export function MultiKeyHandler<TEvent extends KeyboardEvent>(
  handlers: KeyboardHandlerFn[]
) {
  return (event: TEvent) => {
    for (const handler of handlers) {
      handler(event);
    }
  };
}

export function CommandHandler<TEvent extends KeyboardEvent>(
  callback: (event: TEvent) => void | Promise<void>
) {
  return (event: TEvent) => {
    if (event.key === "p" && event.ctrlKey) {
      callback(event);
    }
  };
}

export function EnterHandler<TEvent extends KeyboardEvent>(
  callback: (event: TEvent) => void | Promise<void>
) {
  return (event: TEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      callback(event);
    }
  };
}

export function NewHandler<TEvent extends KeyboardEvent>(
  callback: (event: TEvent) => void | Promise<void>
) {
  return (event: TEvent) => {
    if (event.key === "n" && event.ctrlKey) {
      callback(event);
    }
  };
}

export function SaveHandler<TEvent extends KeyboardEvent>(
  callback: (event: TEvent) => void | Promise<void>
) {
  return (event: TEvent) => {
    if (event.key === "s" && event.ctrlKey) {
      callback(event);
    }
  };
}
