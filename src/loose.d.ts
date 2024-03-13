declare module "react-lines-ellipsis/lib/loose"{
  export interface LinesEllipsisLooseProps<T extends StrComponent>{
    component?: T
    maxLine?: number
    overflowFallback?: boolean
    text: string
    lineHeight?: number | `${number}${"em" | "px"}`
  }

  export type LinesEllipsisLooseExtendedProps<T extends StrComponent> = JSX.IntrinsicElements[T] & LinesEllipsisLooseProps<T>;
  
  export default function LinesEllipsisLoose<
    T extends StrComponent = "div"
  >(props: LinesEllipsisLooseExtendedProps<T>): JSX.Element;

  export const defaultProps: LinesEllipsisLooseProps<"div">;
}