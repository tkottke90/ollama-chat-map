import { NodeDefinitionInput } from "@/lib/models/base-node.data";
import { FileNodeData } from "@/lib/models/file-node.data";
import { open } from '@tauri-apps/plugin-dialog';
import { Node, useReactFlow } from "@xyflow/react";
import { useMemo, useState } from "preact/hooks";
import { Button } from "../ui/button";
import { SimpleNode } from "./base.node";

const ACCEPTED_MIME_TYPES = ["text/*"]
const ACCEPTED_EXTENSIONS = [".txt", ".json", ".js", ".ts", ".jsx", ".tsx", ".md", ".yml", ".yaml", ".xml", ".html", ".css", ".scss", ".py", ".rb", ".rs", ".go", ".java", ".c", ".cpp", ".h", ".sh", ".bash", ".zsh"]

const ACCEPTED_FILE_TYPES = [...ACCEPTED_MIME_TYPES, ...ACCEPTED_EXTENSIONS].join(', ')

function isFileTypeAllowed(file: File) {
  return ACCEPTED_MIME_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.some(ext => file.name.endsWith(ext))
}

type FileNodeProps = Node<FileNodeData, "file-node">;

/**
 * Creates a LLM Node Prompt Definition based on the schema
 * @param input
 * @returns
 */
export function fileNodeFactory(input: NodeDefinitionInput<FileNodeData>): FileNodeProps {
  return {
    id: crypto.randomUUID(),
    type: "file-node",
    position: { x: 0, y: 0 },
    ...input,
    data: new FileNodeData(input.data),
  };
}


export function FileNode(props: FileNodeProps) {
  const { updateNodeData } = useReactFlow();

  return (
    <SimpleNode
      nodeProps={props}
      onToggle={(key) => {
        switch(key) {
          case 'showDebug': {
            const nextState = new FileNodeData(props.data);
            nextState.showDebug = !nextState.showDebug;

            updateNodeData(props.id, nextState, { replace: true });
          }
        }
      }}  
    >
      <div className="node--text-input flex flex-col gap-4">
        <Header {...props} />

        <DataInput {...props} />
      </div>
    </SimpleNode>
  )
}

function Header(props: FileNodeProps) {

  return (
    <div className="flex justify-between items-center">
      <label htmlFor="text" className="font-bold text-lg flex items-center gap-2">
        <props.data.icon /> 
        <span>File</span>
      </label>
    </div>
  )
}

function DataInput(props: FileNodeProps) {
  const [ error, setError ] = useState('');
  const inputId = useMemo(() => { return props.id + '-file' }, [props])

  const { updateNodeData } = useReactFlow();

  return (
    <div className="flex flex-col gap-2 nodrag">
      <Button
        onClick={async () => {
          // Open the file selector dialog
          //   Docs: https://v2.tauri.app/plugin/dialog/#open-a-file-selector-dialog
          const file = await open({
            multiple: false,
            directory: false,
            canCreateDirectories: false,
            filters: [{ name: 'Accepted File Types', extensions: ACCEPTED_EXTENSIONS.map(ext => ext.replace('.', '')) }]
          })

          // If no file found or if the user canceled the dialog
          // don't do anything.
          if (!file) return;

          // Configure the next state
          const nextState = new FileNodeData(props);
          nextState.clearFile();

          await nextState.loadFile(file)
            .then(() => {
              updateNodeData(props.id, nextState, { replace: true });
            })
            .catch(err => {
              setError(`Error Loading File: ${err.message}`)
            });
        }}
      >Select File</Button>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  )
}