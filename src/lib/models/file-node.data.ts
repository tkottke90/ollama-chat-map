import { invoke } from "@tauri-apps/api/core";
import { FileIcon, LucideIcon } from "lucide-preact";
import { BaseChatNodeData } from "./base-node.data";

type FileResponse = {
  content: string;
  mime_type: string;
}

export class FileNodeData extends BaseChatNodeData {

  label = 'File Node'
  icon: LucideIcon = FileIcon;

  locked: boolean = false;
  file?: string;
  mimeType?: string;

  constructor(data?: Partial<FileNodeData>) {
    super();
    Object.assign(this, data);
  }

  async clearFile() {
    this.file = undefined;
    this.mimeType = undefined;
    this.content = '';
    this.locked = false;
  }

  async loadFile(filename: string) {
    const { content, mime_type } = await invoke<FileResponse>('load_txt_file', { filename })

    this.file = filename;
    this.mimeType = mime_type;
    this.content = content;
    this.locked = true;
  }

  toFile() {
    if (!this.file) return;

    return new File([this.content], this.file, { type: this.mimeType })
  }
}