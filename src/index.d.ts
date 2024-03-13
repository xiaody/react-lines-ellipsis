type StrComponent = keyof JSX.IntrinsicElements

declare module "react-lines-ellipsis"{
  export interface LinesEllipsisProps<T extends StrComponent>{
    basedOn?: "letters" | "words"
    className?: string
    component?: T
    ellipsis?: string
    maxLine?: number
    text: string
    trimRight?: boolean
  }

  export type LinesEllipsisPropsExtendedProps<T extends StrComponent> = JSX.IntrinsicElements[T] & LinesEllipsisProps<T>;
  
  export interface LinesEllipsisState{
    text: string
    clamped: boolean
  }
  
  export default class LinesEllipsis<T extends StrComponent = 'div'> extends React.Component<
    LinesEllipsisPropsExtendedProps<T>,
    LinesEllipsisState,
    unknown
  >{
    static defaultProps: LinesEllipsisProps<'div'>;
  }
}