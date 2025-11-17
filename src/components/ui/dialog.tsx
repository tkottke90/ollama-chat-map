import { BaseProps } from "@/lib/utility-types";
import { cn, createContextWithHook, useHtmlElementListeners } from "@/lib/utils";
import { cloneElement, Fragment, JSX } from "preact";
import { useEffect, useRef } from "preact/hooks";


const dialogContext = createContextWithHook<{
  onClose: () => void
}>();

export function Dialog({ children, trigger, className, dismissible = true }: BaseProps<{ trigger: JSX.Element, dismissible?: boolean }>) {
  const modalRef = useRef<HTMLDialogElement>(null)

  const triggerRef = useHtmlElementListeners(
    [
      [ 'click', () =>  openModal(modalRef.current) ]
    ],
    [ trigger ]
  );

  useEffect(() => {
    if (!modalRef.current) return;
    const abort = new AbortController();

    modalRef.current.addEventListener('click', (evt) => {
      if (!modalRef.current) return;
      
      // Get bounding box
      const modalBox = modalRef.current.getBoundingClientRect();

      // Calculate if it it was inside the modal
      const clickWasInside = [
        evt.clientX > modalBox.left &&   // To the right of the left boundary
        evt.clientX < modalBox.right &&  // To the left of the right boundary
        evt.clientY > modalBox.top &&    // Below the top boundary
        evt.clientY < modalBox.bottom    // Above the bottom boundary
      ].every(Boolean)

      // Check if the click happened inside the modal
      if (!clickWasInside && dismissible) {
        closeModal(modalRef.current)
      }
    }, { signal: abort.signal });

    return () => {
      abort.abort();
    }
  }, [ modalRef.current, dismissible ])

  const triggerElement = cloneElement(trigger ?? (<button>Open</button>), { ref: triggerRef })

  return (
    <Fragment>
      { triggerElement }
      
      <dialog ref={modalRef} className={cn("bg-card ring-transparent p-4", className)}>
        <dialogContext.Provider value={{
          onClose: () => closeModal(modalRef.current)
        }}>
          {children}
        </dialogContext.Provider>
      </dialog>
    </Fragment>

  )
}

type ModalRef = HTMLDialogElement | null;

export function openModal(modal: ModalRef, onOpen?: (() => void)) {
  if (modal) {
    if (onOpen) {
      onOpen();
    }

    modal.showModal();
  }
}

export function closeModal(modal: ModalRef, value?: string) {
  if (modal) {
    modal.close(value);
  }
}

export function cancelModal(modal: ModalRef, onCancel?: (() => void)) {
  if (onCancel) {
    onCancel();
  }
  
  closeModal(modal);
}

export const useDialog = dialogContext.useHook;