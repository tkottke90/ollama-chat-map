import { invoke } from "@tauri-apps/api/core";
import { File, LucideIcon } from "lucide-preact";
import { BaseChatNodeData } from "./base-node.data";

export class FileNodeData extends BaseChatNodeData {

  label = 'File Node'
  icon: LucideIcon = File;

  file?: string;

  constructor(data?: Partial<FileNodeData>) {
    super();
    Object.assign(this, data);
  }

  async clearFile() {
    this.file = undefined;
    this.content = '';
  }

  async loadFile(filename: string) {
    const data = await invoke<string>('load_txt_file', { filename })

    this.file = filename;
    this.content = data;
  }
}