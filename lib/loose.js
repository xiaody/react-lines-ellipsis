'use strict';

var React = require('react');

function LinesEllipsisLoose(props) {
  var _props$component = props.component,
      Component = _props$component === undefined ? 'div' : _props$component,
      text = props.text,
      lineHeight = props.lineHeight;

  var lineHeightNumber = parseInt(lineHeight, 10);
  var unit = typeof lineHeight === 'string' && lineHeight.trim().endsWith('em') ? 'em' : 'px';
  var maxLine = +props.maxLine || 1;
  return React.createElement(
    Component,
    {
      style: {
        lineHeight: '' + lineHeightNumber + unit,
        maxHeight: '' + maxLine * lineHeightNumber + unit,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: maxLine
      }
    },
    text
  );
}

module.exports = LinesEllipsisLoose;

