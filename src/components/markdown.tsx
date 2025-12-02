import { BaseProps } from "@/lib/utility-types";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";


export function MarkdownDisplay(props: BaseProps<{ children: string }>) {

  return (
    <Markdown remarkPlugins={[remarkGfm]}>{props.children}</Markdown>
  )
}