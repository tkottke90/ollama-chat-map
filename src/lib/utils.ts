import { clsx, type ClassValue } from "clsx";
import { createContext } from "preact";
import { Inputs, useCallback, useContext } from "preact/hooks";
import { twMerge } from "tailwind-merge";

// Get the appropriate event map based on the target type
type EventMapFor<T extends EventTarget> =
  T extends Window ? WindowEventMap :
  T extends Document ? DocumentEventMap :
  T extends HTMLElement ? HTMLElementEventMap :
  T extends SVGElement ? SVGElementEventMap :
  Record<string, Event>;

type EventEntry<
  TTarget extends EventTarget,
  TMap = EventMapFor<TTarget>
> = {
  [K in keyof TMap]: [K, (event: TMap[K]) => void]
}[keyof TMap];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createContextWithHook<TContextProps>() {
  const context = createContext<TContextProps>({} as any);

  return {
    Provider: context.Provider,
    useHook: () => {
      const ctx = useContext(context);

      if (!ctx) {
        throw new Error('Invalid Context Hook.  No Context Found');
      }

      return ctx;
    }
  }
}

export function registerEvent(
  element: HTMLElement,
  eventName: string,
  event: (e: Event) => void
) {
  if (element) {
    element.addEventListener(eventName, event);
  }

  return () => {
    if (element) {
      element.removeEventListener(eventName, event);
    }
  };
}

export function registerEventList<TTarget extends EventTarget>(
  target: TTarget,
  events: EventEntry<TTarget>[],
  abort?: AbortController
) {
  const abortCtrl = abort ?? new AbortController();

  for (const [name, fn] of events) {
    target.addEventListener(name as string, fn as EventListener, { signal: abortCtrl.signal });
  }

  return () => {
    abortCtrl.abort();
  }
}

export function useHtmlElementListeners(
  events: [eventName: string, event: (e: Event) => void][],
  inputs: Inputs = []
) {
  return useCallback((node: HTMLElement | null) => {
    // Skip of no node is present
    if (!node) return;

    // Loop over each event provided and register it with the node
    const eventListeners = events.map(
      ([name, eventFn]) => registerEvent(node, name, eventFn )
    );

    // Register a cleanup method which unsubscribes from each
    // event during the unmounting process
    return () => {
      eventListeners.map(unsubscriber => unsubscriber())
    }
  }, inputs)
}