import * as React from "react";

interface LinesEllipsisLooseProps {
  component: any;
  text: string;
  lineHeight: string | number;
  maxLine: number;
  style: React.CSSProperties;
  overflowFallback: boolean;
}

function LinesEllipsisLoose(props: LinesEllipsisLooseProps) {
  const {
    component: Component,
    text,
    lineHeight,
    maxLine,
    style,
    overflowFallback,
    ...rest
  } = props;
  const maxLineNumber = +maxLine || 1;
  let usedStyle = {
    ...style,
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: maxLineNumber,
  };
  if (overflowFallback && lineHeight) {
    const lineHeightNumber =
      typeof lineHeight === "string" ? parseFloat(lineHeight) : lineHeight;
    const unit =
      typeof lineHeight === "string" && lineHeight.trim().endsWith("em")
        ? "em"
        : "px";
    usedStyle = {
      ...usedStyle,
      lineHeight: `${lineHeightNumber}${unit}`,
      maxHeight: `${maxLineNumber * lineHeightNumber}${unit}`,
      overflow: "hidden",
    };
  }
  return (
    <Component {...rest} style={usedStyle}>
      {text}
    </Component>
  );
}

LinesEllipsisLoose.defaultProps = {
  component: "div",
  maxLine: 1,
  style: {},
  overflowFallback: true,
};

export default LinesEllipsisLoose;
