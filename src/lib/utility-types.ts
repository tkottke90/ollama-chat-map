
import { RenderableProps } from 'preact';
import { BaseNodeData } from './models/base-node.data';

type ComponentProps = Record<string, unknown> & {
  className?: string
}

export type Constructor<T = BaseNodeData> = new (data?: Partial<T>) => T;

export type Nullable<T> = T | null; 

export type BaseProps<
 TProps extends ComponentProps = ComponentProps, 
 TRef = any
> = RenderableProps<TProps, TRef>