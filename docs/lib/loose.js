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
function LinesEllipsisLoose(_ref) {
  var _ref$component = _ref.component,
    Component = _ref$component === void 0 ? 'div' : _ref$component,
    text = _ref.text,
    lineHeight = _ref.lineHeight,
    _ref$maxLine = _ref.maxLine,
    maxLine = _ref$maxLine === void 0 ? 1 : _ref$maxLine,
    _ref$style = _ref.style,
    style = _ref$style === void 0 ? {} : _ref$style,
    _ref$overflowFallback = _ref.overflowFallback,
    overflowFallback = _ref$overflowFallback === void 0 ? true : _ref$overflowFallback,
    rest = _objectWithoutPropertiesLoose(_ref, _excluded);
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
  return /*#__PURE__*/React__default["default"].createElement(Component, _extends({}, rest, {
    style: usedStyle
  }), text);
}

module.exports = LinesEllipsisLoose;
