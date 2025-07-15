import React from "../_snowpack/pkg/react.js";
function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function(n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t)
        ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
function _objectWithoutPropertiesLoose(r, e) {
  if (r == null)
    return {};
  var t = {};
  for (var n in r)
    if ({}.hasOwnProperty.call(r, n)) {
      if (e.indexOf(n) !== -1)
        continue;
      t[n] = r[n];
    }
  return t;
}
const _excluded = ["component", "text", "lineHeight", "maxLine", "style", "overflowFallback"];
function LinesEllipsisLoose(props) {
  const {
    component: Component,
    text,
    lineHeight,
    maxLine,
    style,
    overflowFallback
  } = props, rest = _objectWithoutPropertiesLoose(props, _excluded);
  const maxLineNumber = +maxLine || 1;
  let usedStyle = _extends({}, style, {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: maxLineNumber
  });
  if (overflowFallback && lineHeight) {
    const lineHeightNumber = parseFloat(lineHeight);
    const unit = typeof lineHeight === "string" && lineHeight.trim().endsWith("em") ? "em" : "px";
    usedStyle = _extends({}, usedStyle, {
      lineHeight: `${lineHeightNumber}${unit}`,
      maxHeight: `${maxLineNumber * lineHeightNumber}${unit}`,
      overflow: "hidden"
    });
  }
  return /* @__PURE__ */ React.createElement(Component, _extends({}, rest, {
    style: usedStyle
  }), text);
}
LinesEllipsisLoose.defaultProps = {
  component: "div",
  maxLine: 1,
  style: {},
  overflowFallback: true
};
export default LinesEllipsisLoose;
