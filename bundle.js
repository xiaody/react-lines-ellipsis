'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');

var canvasStyle = {
  height: 0,
  overflow: 'hidden',
  'padding-top': 0,
  'padding-bottom': 0,
  border: 'none'
};
var styleProps = ['box-sizing', 'width', 'font-size', 'font-weight', 'font-family', 'font-style', 'letter-spacing', 'text-indent', 'white-space', 'word-break', 'padding-left', 'padding-right'];

function prevSibling(node, count) {
  while (node && count--) {
    node = node.previousElementSibling;
  }
  return node;
}

/**
 * props.text {String} the text you want to clamp
 * props.maxLine {Number|String} max lines allowed
 * props.ellipsis {String} the ellipsis indicator
 * props.trimRight {Boolean} should we trimRight the clamped text?
 * props.className {String}
 */

var LinesEllipsis = function (_React$Component) {
  _inherits(LinesEllipsis, _React$Component);

  function LinesEllipsis(props) {
    _classCallCheck(this, LinesEllipsis);

    var _this = _possibleConstructorReturn(this, (LinesEllipsis.__proto__ || Object.getPrototypeOf(LinesEllipsis)).call(this, props));

    _this.state = {
      text: props.text,
      clamped: false
    };
    _this.chars = [];
    _this.maxLine = 0;
    _this.canvas = null;
    return _this;
  }

  _createClass(LinesEllipsis, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.initCanvas();
      this.reflow(this.props);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      this.reflow(nextProps);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }, {
    key: 'initCanvas',
    value: function initCanvas() {
      if (this.canvas) return;
      var canvas = this.canvas = document.createElement('div');
      canvas.className = 'LinesEllipsis-canvas ' + this.props.className;
      var targetStyle = window.getComputedStyle(this.target);
      styleProps.forEach(function (key) {
        canvas.style[key] = targetStyle[key];
      });
      Object.keys(canvasStyle).forEach(function (key) {
        canvas.style[key] = canvasStyle[key];
      });
      document.body.appendChild(canvas);
    }
  }, {
    key: 'reflow',
    value: function reflow(props) {
      this.chars = Array.from(props.text);
      this.maxLine = +props.maxLine || 1;
      this.canvas.innerHTML = this.chars.map(function (c) {
        return '<span class=\'LinesEllipsis-char\'>' + c + '</span>';
      }).join('');
      var ellipsisIndex = this.putEllipsis(this.calcIndexes());
      var clamped = ellipsisIndex > -1;
      this.setState({
        clamped: clamped,
        text: clamped ? this.chars.slice(0, ellipsisIndex).join('') : props.text
      });
    }
  }, {
    key: 'calcIndexes',
    value: function calcIndexes() {
      var indexes = [0];
      var elt = this.canvas.firstElementChild;
      if (!elt) return indexes;

      var index = 0;
      var line = 1;
      var offsetTop = elt.offsetTop;
      while (elt = elt.nextElementSibling) {
        if (elt.offsetTop > offsetTop) {
          line++;
          indexes.push(index);
          offsetTop = elt.offsetTop;
        }
        index++;
        if (line > this.maxLine) {
          break;
        }
      }
      return indexes;
    }
  }, {
    key: 'putEllipsis',
    value: function putEllipsis(indexes) {
      if (indexes.length <= this.maxLine) return -1;
      var chars = this.chars.slice(0, indexes[this.maxLine]);
      this.canvas.innerHTML = chars.map(function (c, i) {
        return '<span class=\'LinesEllipsis-char\'>' + c + '</span>';
      }).join('') + ('<wbr><span class=\'LinesEllipsis-ellipsis\'>' + this.props.ellipsis + '</span>');

      var ndEllipsis = this.canvas.lastElementChild;
      var ndPrevChar = prevSibling(ndEllipsis, 2);
      while (ndPrevChar && (ndEllipsis.offsetHeight > ndPrevChar.offsetHeight || ndEllipsis.offsetTop > ndPrevChar.offsetTop)) {
        this.canvas.removeChild(ndPrevChar);
        ndPrevChar = prevSibling(ndEllipsis, 2);
        chars.pop();
      }
      return chars.length;
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _state = this.state,
          text = _state.text,
          clamped = _state.clamped;
      var _props = this.props,
          ellipsis = _props.ellipsis,
          trimRight = _props.trimRight,
          className = _props.className;

      return React.createElement(
        'div',
        {
          className: 'LinesEllipsis ' + (clamped ? 'LinesEllipsis--clamped' : '') + ' ' + className,
          ref: function ref(node) {
            return _this2.target = node;
          }
        },
        clamped && trimRight ? text.replace(/[\s\uFEFF\xA0]+$/, '') : text,
        React.createElement('wbr', null),
        clamped && React.createElement(
          'span',
          { className: 'LinesEllipsis-ellipsis' },
          ellipsis
        )
      );
    }
  }]);

  return LinesEllipsis;
}(React.Component);

LinesEllipsis.defaultProps = {
  text: '',
  maxLine: 1,
  ellipsis: '…', // &hellip;
  trimRight: true,
  className: ''
};

module.exports = LinesEllipsis;

