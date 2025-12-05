import { JSXInternal } from "node_modules/preact/src/jsx";
import { BLANK_FILE_SVG } from "./blank-file";
import { FileIcon, FileIconProps } from './file.icon';

const ApplicationRed = '#D92D20';
const CodeOrange = ' #e68a00';
const DocumentBlue = '#155EEF';
const ImagePurple = '#7F56D9';
const TextBlack = '#222';




const icons: Record<string, (props: Partial<FileIconProps>) => JSXInternal.Element> = {
  'application/pdf': (props: Partial<FileIconProps>) => FileIcon({ name: 'PDF', fill: ApplicationRed, ...props }),
  'application/rss+xml': (props: Partial<FileIconProps>) => FileIcon({ name: 'RSS', fill: TextBlack, ...props }),
  'image/*': (props: Partial<FileIconProps>) =>  FileIcon({ name: 'IMG', fill: ImagePurple, ...props }),
  'text/plain': (props: Partial<FileIconProps>) => FileIcon({ name: 'TXT', fill: TextBlack, ...props }),
  'text/html': (props: Partial<FileIconProps>) => FileIcon({ name: 'HTML', fill: CodeOrange, ...props }),
  'text/css': (props: Partial<FileIconProps>) => FileIcon({ name: 'CSS', fill: CodeOrange, ...props }),
  'text/javascript': (props: Partial<FileIconProps>) => FileIcon({ name: 'JS', fill: CodeOrange, ...props }),
  'text/typescript': (props: Partial<FileIconProps>) => FileIcon({ name: 'TS', fill: CodeOrange, ...props }),
  'text/markdown': (props: Partial<FileIconProps>) => FileIcon({ name: 'MD', fill: DocumentBlue, ...props }),
}

export function getFileIcon(name: string) {
  const icon = icons[name];

  if (icon) return icon;

  return BLANK_FILE_SVG;
}
