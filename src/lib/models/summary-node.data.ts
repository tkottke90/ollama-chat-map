import { BookOpenText, LucideIcon } from "lucide-preact";
import { BaseChatNodeData } from "./base-node.data";

export class SummaryNodeData extends BaseChatNodeData {

  label = 'Summary Node'
  icon: LucideIcon = BookOpenText;

  constructor(data?: Partial<SummaryNodeData>) {
    super();
    Object.assign(this, data);
  }
}

