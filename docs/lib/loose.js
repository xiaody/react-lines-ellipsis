var React = require('react');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };
  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
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

  return /*#__PURE__*/React__default["default"].createElement(Component, _extends({}, rest, {
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
