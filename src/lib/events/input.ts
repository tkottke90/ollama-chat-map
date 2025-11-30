

export function ChangeHandler<TEvent extends Event>(
  callback: (value: string) => void | Promise<void>
) {
  return (event: TEvent) => {
    const target = event.currentTarget as HTMLInputElement

    if (target) {
      callback(target.value);
    } else {
      console.warn('Change handler called with no target')
    }
  };
}