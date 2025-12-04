import { JSXInternal } from "node_modules/preact/src/jsx";
import { BLANK_FILE_SVG } from "./blank-file";
import { FileIcon } from './file.icon';

const ApplicationRed = '#D92D20';
const CodeOrange = '#ff9900';
const DocumentBlue = '#155EEF';
const ImagePurple = '#7F56D9';
const TextBlack = '#222';


const icons: Record<string, () => JSXInternal.Element> = {
  'application/pdf': () => FileIcon({ name: 'PDF', fill: ApplicationRed }),
  'application/rss+xml': () => FileIcon({ name: 'RSS', fill: TextBlack }),
  'image/*': () => FileIcon({ name: 'IMG', fill: ImagePurple }),
  'text/plain': () => FileIcon({ name: 'TXT', fill: TextBlack }),
  'text/html': () => FileIcon({ name: 'HTML', fill: CodeOrange }),
  'text/css': () => FileIcon({ name: 'CSS', fill: CodeOrange }),
  'text/javascript': () => FileIcon({ name: 'JS', fill: CodeOrange }),
  'text/typescript': () => FileIcon({ name: 'TS', fill: CodeOrange }),
  'text/markdown': () => FileIcon({ name: 'MD', fill: DocumentBlue }),
}

export function getFileIcon(name: string) {
  const icon = icons[name];

  if (icon) return icon;

  return BLANK_FILE_SVG;
}
