import { BaseProps } from "@/lib/utility-types";
import { useMemo } from "preact/hooks";
import { Fragment } from "preact/jsx-runtime";
import { getFileIcon } from "./icons";

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function FileDisplay({ file }: BaseProps<{ file: File }>) {

  const FileIcon = useMemo(() => getFileIcon(file.type), [file]);

  return (
    <Fragment>
      <div className="grid grid-rows-2 font-bold">
        <div className="flex gap-2 items-start">
          <FileIcon size={32} />
          <span className="text-lg">{file.name.split('/').at(-1)}</span>
        </div>
        <div className="flex items-center text-sm">
          <span>{formatBytes(file.size)}</span>
          &nbsp;
          <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="inline" width="4" height="5" viewBox="0 0 3 4" fill="none">
              <circle cx="1.5" cy="2" r="1.5" className="fill-green-600"/>
          </svg>
          &nbsp;
          <span>{file.type.split('/').at(-1)?.toUpperCase()}</span>
        </div>
      </div>
    </Fragment>
  )
}