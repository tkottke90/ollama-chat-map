import { BaseProps } from "@/lib/utility-types";
import { createContextWithHook } from "@/lib/utils";
import { JSX } from "preact";
import { Dialog } from "./dialog";


const drawerContext = createContextWithHook<{
  onClose: () => void
}>();


export function Drawer({ children, trigger }: BaseProps<{ trigger: JSX.Element }>) {
  return (
    <Dialog
      className="h-full max-h-full min-w-10/12 sm:min-w-xs"
      trigger={trigger}
    >
      {children}
    </Dialog>
  )
}

type ModalRef = HTMLDialogElement | null;

export const useDrawer = drawerContext.useHook;