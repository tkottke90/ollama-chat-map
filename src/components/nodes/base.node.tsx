// import { Node } from "@xyflow/react";
import { BaseProps } from "../../lib/utility-types";

// export type NodeConstructor<TData extends Record<string, unknown>, TLabel extends string> 
//   = Omit<Node<TData, TLabel>, "id"> & { id?: string }

// export class BaseNodeElement<TData extends Record<string, unknown>, TLabel extends string> {
//   private node: Node<TData, TLabel>;

//   constructor(options: NodeConstructor<TData, TLabel>) {
//     this.node = {
//       ...options,
//       id: options.id ?? crypto.randomUUID(),
//     }
//   }

//   toNode(): Node<TData, TLabel> {
//     return ({
//       id: this.id,
//       type: "llm-prompt",
      
//       data: {
//         label: "Node",
//       },
//     })
//   }
// }

export function BaseNode({
  children,
  className,
}: BaseProps<{ className?: string }>) {
  return <div className={`node relative ${className ?? ""}`}>{children}</div>;
}
