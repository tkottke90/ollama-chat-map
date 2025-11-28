import { SavingStates } from "@/lib/hooks/useSaveState";
import { BaseProps } from "@/lib/utility-types";
import { registerEventList } from "@/lib/utils";
import { Panel } from "@xyflow/react";
import { Check, Save, SparklesIcon } from "lucide-preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { useMindMapStateContext } from "./state";
import { AddNodeMenu } from "./toolbar/add-nodes";
import { FileDrawer } from "./toolbar/file-drawer";
import { iconStyle } from "./toolbar/toolbar-constants";
import { ToolbarButton, ToolbarGroup, ToolbarSeparator } from "./toolbar/toolbar-utils";
import { ZoomIn, ZoomOut, ZoomToFit } from "./toolbar/viewport-controls";

interface ActionMenuProps extends BaseProps {}

export function ActionsToolbar({}: ActionMenuProps) {
  return (
    <Panel position="top-left" className="flex flex-col gap-2 h-fit">
      <ToolbarGroup>
        <FileDrawer />
      </ToolbarGroup>

      <ToolbarGroup>
        <SaveButton />
        <ToolbarSeparator />
        <AddNodeMenu />
      </ToolbarGroup>

      <ToolbarGroup>
        <ZoomIn />
        <ZoomOut />
        <ZoomToFit />
      </ToolbarGroup>
    </Panel>
  )
}

function saveStateStyles(saveState: SavingStates) {
  if (saveState === SavingStates.SAVING) {
    return 'opacity-50 cursor-wait! bg-blue-300 stroke-blue-600'
  }

  if (saveState === SavingStates.UNSAVED) {
    return 'bg-yellow-200 hover:bg-yellow-300 stroke-amber-500'
  }

  return 'bg-green-200 stroke-green-500 hover:bg-green-300 hover:stroke-green-900'
}

function SaveButtonIcon(saveState: SavingStates) {
  if (saveState === SavingStates.SAVING) {
    return (<SparklesIcon className={`${iconStyle} animate-spin`} />)
  }

  if (saveState === SavingStates.UNSAVED) {
    return (<Save className={iconStyle} />)
  }

  return (<Check className={iconStyle} />)
}

function SaveButton() {
  const [ savingState, setSavingState ] = useState(SavingStates.SAVED);
  const { stateEvents, onSave } = useMindMapStateContext();

  useEffect(() => {
    const unlisten = registerEventList(
      stateEvents,
      [
        ['saved', () => setSavingState(SavingStates.SAVED)],
        ['unsaved', () => setSavingState(SavingStates.UNSAVED)]
      ]
    )

    return unlisten;
  }, [])

  const style = useMemo(() => saveStateStyles(savingState), [savingState]);
  const icon = useMemo(() => SaveButtonIcon(savingState), [savingState]);
  const disabled = useMemo(() => savingState === SavingStates.SAVED, [savingState])
  const title = useMemo(() => savingState === SavingStates.SAVED ? 'Saved (Cmd/Ctrl+S)' : 'Unsaved changes (Cmd/Ctrl+S to save)', [savingState])

  return (
    <ToolbarButton
      className={`w-full p-2 cursor-pointer! transition-colors ${style}`}
      onClick={() => onSave()}
      disabled={disabled}
      title={title}
    >
      {icon}
    </ToolbarButton>
  );
}

