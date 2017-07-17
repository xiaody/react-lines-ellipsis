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
      rest = _objectWithoutProperties(props, ['component', 'text', 'lineHeight', 'maxLine', 'style']);

  var lineHeightNumber = parseFloat(lineHeight);
  var unit = typeof lineHeight === 'string' && lineHeight.trim().endsWith('em') ? 'em' : 'px';
  var maxLineNumber = +maxLine || 1;
  return React.createElement(
    Component,
    _extends({}, rest, {
      style: _extends({}, style, {
        lineHeight: '' + lineHeightNumber + unit,
        maxHeight: '' + maxLineNumber * lineHeightNumber + unit,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: maxLineNumber
      })
    }),
    text
  );
}

LinesEllipsisLoose.defaultProps = {
  component: 'div',
  maxLine: 1,
  style: {}
};

module.exports = LinesEllipsisLoose;

