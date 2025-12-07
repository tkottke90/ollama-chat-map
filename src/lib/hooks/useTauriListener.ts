import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "preact/hooks";

export function useTauriListener<TEventPayload>(eventName: string, defaultValue: TEventPayload) {
  const [eventPayload, setEventPayload] = useState<TEventPayload>(defaultValue);
  
  useEffect(() => {
    const unlisten = listen<TEventPayload>(eventName, (event) => {
      // console.debug(`Event [${eventName}] received - ${event.id}`);
      setEventPayload(event.payload);
    });

    return async () => {
      (await unlisten)();
    };
  }, [eventName]);

  return eventPayload;
}

export function useTauriEvent<TEventPayload>(eventName: string, callback: (payload: TEventPayload) => void) {
  useEffect(() => {
    const unlisten = listen<TEventPayload>(eventName, (event) => {
      console.debug(`Event [${eventName}] received - ${event.id}`);
      callback(event.payload);
    });

    return async () => {
      (await unlisten)();
    };
  }, [eventName]);
}