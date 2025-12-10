import { useCallback, useEffect, useRef } from "preact/hooks";
import { Nullable } from "../utility-types";

type Timeout = ReturnType<typeof setTimeout>

export function useDebounce<T>(delay: number, callback: (...args: T[]) => void | Promise<void>) {
  // Setup ref to track timeout
  const elemRef = useRef<Nullable<Timeout>>(null);

  // Return debounced version of the method
  return useCallback((...args: T[]) => {
    
    // If the timeout already exists, then cancel it
    // so that the callback doesn't trigger
    if (elemRef.current) {
      clearTimeout(elemRef.current)
    }

    // Create timeout which will fire the callback
    // after the delay
    elemRef.current = setTimeout(() => {
      // Wrap the callback in a Promise.allSettled
      // so that we wait for any and all promises to resolve
      // before clearing the timeout
      Promise.allSettled([

        // Request an animation frame so that 
        // the callback happens after the current 
        // render has resolved
        requestAnimationFrame(() => callback(...args))
      ]).finally(() => {
        //Regardless of the result, clear the timeout
       if (elemRef.current) clearTimeout(elemRef.current)
      })
    }, delay);
  }, [ callback, delay ])
}

export function useDebounceEffect(delay: number, callback: () => void | Promise<void>) {
  // Setup ref to track timeout
  const elemRef = useRef<Nullable<Timeout>>(null);

  // Return debounced version of the method
  return useEffect(() => {
    
    // If the timeout already exists, then cancel it
    // so that the callback doesn't trigger
    if (elemRef.current) {
      clearTimeout(elemRef.current)
    }

    // Create timeout which will fire the callback
    // after the delay
    elemRef.current = setTimeout(() => {
      // Wrap the callback in a Promise.allSettled
      // so that we wait for any and all promises to resolve
      // before clearing the timeout
      Promise.allSettled([

        // Request an animation frame so that 
        // the callback happens after the current 
        // render has resolved
        requestAnimationFrame(() => callback())
      ]).finally(() => {
        //Regardless of the result, clear the timeout
       if (elemRef.current) clearTimeout(elemRef.current)
      })
    }, delay);
  })
}