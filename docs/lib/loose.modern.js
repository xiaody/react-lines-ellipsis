import React from '../_snowpack/pkg/react.js';

function _extends() {
  _extends = Object.assign || function (target) {
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

function LinesEllipsisLoose(props) {
  const {
    component: Component,
    text,
    lineHeight,
    maxLine,
    style,
    overflowFallback
  } = props,
        rest = _objectWithoutPropertiesLoose(props, ["component", "text", "lineHeight", "maxLine", "style", "overflowFallback"]);

  const maxLineNumber = +maxLine || 1;

  let usedStyle = _extends({}, style, {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: maxLineNumber
  });

  if (overflowFallback && lineHeight) {
    const lineHeightNumber = parseFloat(lineHeight);
    const unit = typeof lineHeight === 'string' && lineHeight.trim().endsWith('em') ? 'em' : 'px';
    usedStyle = _extends({}, usedStyle, {
      lineHeight: `${lineHeightNumber}${unit}`,
      maxHeight: `${maxLineNumber * lineHeightNumber}${unit}`,
      overflow: 'hidden'
    });
  }

  return /*#__PURE__*/React.createElement(Component, _extends({}, rest, {
    style: usedStyle
  }), text);
}

LinesEllipsisLoose.defaultProps = {
  component: 'div',
  maxLine: 1,
  style: {},
  overflowFallback: true
};

export default LinesEllipsisLoose;
