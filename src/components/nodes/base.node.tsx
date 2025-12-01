import { BaseProps } from "../../lib/utility-types";

export function BaseNode({
  children,
  className,
}: BaseProps<{ className?: string }>) {
  return <div className={`node relative ${className ?? ""}`}>{children}</div>;
}
