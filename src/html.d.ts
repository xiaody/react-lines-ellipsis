declare module "react-lines-ellipsis/lib/html" {
  export interface HTMLEllipsisProps<T extends StrComponent>{
    component?: T
    unsafeHTML?: string
    maxLine?: number
    ellipsis?: string
    ellipsisHTML?: string
    className?: string
    basedOn?: "letters" | "words"
  }

  export type HTMLEllipsisExtendedProps<T extends StrComponent> = JSX.IntrinsicElements[T] & HTMLEllipsisProps<T>;
  
  export interface HTMLEllipsisState{
    html: string | undefined
    clamped: boolean
  }
  
  export default class HTMLEllipsis<T extends StrComponent = "div"> extends React.Component<
    HTMLEllipsisExtendedProps<T>,
    HTMLEllipsisState,
    unknown
  >{
    static defaultProps: HTMLEllipsisProps<"div">;
  }
}