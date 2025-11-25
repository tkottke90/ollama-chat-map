import { BaseProps } from "@/lib/utility-types";
import { Panel } from "@xyflow/react";
import { Check, Save, SparklesIcon } from "lucide-preact";
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

function SaveButton() {
  const { saveState, onSave } = useMindMapStateContext();

  const handleSave = () => {
    onSave();
  };

  return (
    <ToolbarButton
      className={`w-full p-2 cursor-pointer! transition-colors ${
        saveState.isSaved
          ? 'bg-green-200 hover:bg-green-300 hover:stroke-green-900'
          : 'bg-yellow-200 hover:bg-yellow-300'
      } ${saveState.isSaving ? 'opacity-50 cursor-wait!' : ''}`}
      onClick={handleSave}
      disabled={saveState.isSaving}
      title={saveState.isSaved ? 'Saved (Cmd/Ctrl+S)' : 'Unsaved changes (Cmd/Ctrl+S to save)'}
    >
      {saveState.isSaving ? (
        <SparklesIcon className={`${iconStyle} animate-spin`} />
      ) : saveState.isSaved ? (
        <Check className={iconStyle} />
      ) : (
        <Save className={iconStyle} />
      )}
    </ToolbarButton>
  );
}

