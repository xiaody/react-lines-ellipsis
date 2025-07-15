var React = require('react');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function (n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
function _objectWithoutPropertiesLoose(r, e) {
  if (null == r) return {};
  var t = {};
  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
    if (-1 !== e.indexOf(n)) continue;
    t[n] = r[n];
  }
  return t;
}

var _excluded = ["component", "text", "lineHeight", "maxLine", "style", "overflowFallback"];
function LinesEllipsisLoose(props) {
  var Component = props.component,
    text = props.text,
    lineHeight = props.lineHeight,
    maxLine = props.maxLine,
    style = props.style,
    overflowFallback = props.overflowFallback,
    rest = _objectWithoutPropertiesLoose(props, _excluded);
  var maxLineNumber = +maxLine || 1;
  var usedStyle = _extends({}, style, {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: maxLineNumber
  });
  if (overflowFallback && lineHeight) {
    var lineHeightNumber = parseFloat(lineHeight);
    var unit = typeof lineHeight === 'string' && lineHeight.trim().endsWith('em') ? 'em' : 'px';
    usedStyle = _extends({}, usedStyle, {
      lineHeight: "" + lineHeightNumber + unit,
      maxHeight: "" + maxLineNumber * lineHeightNumber + unit,
      overflow: 'hidden'
    });
  }
  return /*#__PURE__*/React__default['default'].createElement(Component, _extends({}, rest, {
    style: usedStyle
  }), text);
}
LinesEllipsisLoose.defaultProps = {
  component: 'div',
  maxLine: 1,
  style: {},
  overflowFallback: true
};

module.exports = LinesEllipsisLoose;
