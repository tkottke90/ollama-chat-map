import { FileText, LucideIcon } from "lucide-preact";
import { BaseChatNodeData } from "./base-node.data";

export class TextNodeData extends BaseChatNodeData {

  icon: LucideIcon = FileText;

  constructor(data?: Partial<TextNodeData>) {
    super();
    Object.assign(this, data);
  }
}