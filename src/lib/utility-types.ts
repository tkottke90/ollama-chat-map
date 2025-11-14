
import { RenderableProps } from 'preact'

type ComponentProps = Record<string, unknown> & {
  className?: string
}

export type BaseProps<
 TProps extends ComponentProps = ComponentProps, 
 TRef = any
> = RenderableProps<TProps, TRef>