import React from "../_snowpack/pkg/react.js";
function LinesEllipsisLoose({
  component: Component = "div",
  text,
  lineHeight,
  maxLine = 1,
  style = {},
  overflowFallback = true,
  ...rest
}) {
  const maxLineNumber = +maxLine || 1;
  let usedStyle = {
    ...style,
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: maxLineNumber
  };
  if (overflowFallback && lineHeight) {
    const lineHeightNumber = parseFloat(lineHeight);
    const unit = typeof lineHeight === "string" && lineHeight.trim().endsWith("em") ? "em" : "px";
    usedStyle = {
      ...usedStyle,
      lineHeight: `${lineHeightNumber}${unit}`,
      maxHeight: `${maxLineNumber * lineHeightNumber}${unit}`,
      overflow: "hidden"
    };
  }
  return /* @__PURE__ */ React.createElement(Component, {
    ...rest,
    style: usedStyle
  }, text);
}
export default LinesEllipsisLoose;
