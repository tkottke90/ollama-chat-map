export function EnterHandler<TEvent extends KeyboardEvent>(
  callback: (event: TEvent) => void | Promise<void>
) {
  return (event: TEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      callback(event);
    }
  };
}