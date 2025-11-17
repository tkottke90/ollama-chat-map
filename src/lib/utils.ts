import { clsx, type ClassValue } from "clsx";
import { createContext } from "preact";
import { Inputs, useCallback, useContext } from "preact/hooks";
import { twMerge } from "tailwind-merge";


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