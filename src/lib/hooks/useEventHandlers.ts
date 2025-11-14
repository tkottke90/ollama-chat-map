import { Inputs, useEffect } from "preact/hooks";

/**
 * Utility hook for setting up event listeners on DOM elements
 * which handles setup and teardown of event listeners using
 * abort signals
 * @param callback The callback function that is called when the event listeners are added
 */
export function useEventHandlers(callback: (signal: AbortSignal) => void, inputs?: Inputs[]) { 

  useEffect(() => {
    // Creates a new abort controller
    const abort = new AbortController();

    // Provides the signal for use in the callback
    callback(abort.signal);

    // Cleans up the event listeners when the component unmounts
    return () => {
      abort.abort();
    }
  }, inputs)

}