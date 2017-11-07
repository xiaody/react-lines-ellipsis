'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var React = require('react');

function LinesEllipsisLoose(props) {
  var Component = props.component,
      text = props.text,
      lineHeight = props.lineHeight,
      maxLine = props.maxLine,
      style = props.style,
      overflowFallback = props.overflowFallback,
      rest = _objectWithoutProperties(props, ['component', 'text', 'lineHeight', 'maxLine', 'style', 'overflowFallback']);

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
      lineHeight: '' + lineHeightNumber + unit,
      maxHeight: '' + maxLineNumber * lineHeightNumber + unit,
      overflow: 'hidden'
    });
  }
  return React.createElement(
    Component,
    _extends({}, rest, { style: usedStyle }),
    text
  );
}

LinesEllipsisLoose.defaultProps = {
  component: 'div',
  maxLine: 1,
  style: {},
  overflowFallback: true
};

module.exports = LinesEllipsisLoose;

