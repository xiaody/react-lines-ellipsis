'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');

var _require = require('./common'),
    canvasStyle = _require.canvasStyle,
    mirrorProps = _require.mirrorProps;

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
 * props.basedOn {String} letters|words
 * props.className {String}
 */

var LinesEllipsis = function (_React$PureComponent) {
  _inherits(LinesEllipsis, _React$PureComponent);

  function LinesEllipsis(props) {
    _classCallCheck(this, LinesEllipsis);

    var _this = _possibleConstructorReturn(this, (LinesEllipsis.__proto__ || Object.getPrototypeOf(LinesEllipsis)).call(this, props));

    _this.state = {
      text: props.text,
      clamped: false
    };
    _this.units = [];
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
      if (nextProps.winWidth !== this.props.winWidth) {
        this.copyStyleToCanvas();
      }
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
      this.copyStyleToCanvas();
      Object.keys(canvasStyle).forEach(function (key) {
        canvas.style[key] = canvasStyle[key];
      });
      document.body.appendChild(canvas);
    }
  }, {
    key: 'copyStyleToCanvas',
    value: function copyStyleToCanvas() {
      var _this2 = this;

      var targetStyle = window.getComputedStyle(this.target);
      mirrorProps.forEach(function (key) {
        _this2.canvas.style[key] = targetStyle[key];
      });
    }
  }, {
    key: 'reflow',
    value: function reflow(props) {
      /* eslint-disable no-control-regex */
      var basedOn = props.basedOn || /^[\x00-\x7F]+$/.test(props.text) ? 'words' : 'letters';
      switch (basedOn) {
        case 'words':
          this.units = props.text.split(/\b|(?=\W)/);
          break;
        case 'letters':
          this.units = Array.from(props.text);
          break;
        default:
          throw new Error('Unsupported options basedOn: ' + basedOn);
      }
      this.maxLine = +props.maxLine || 1;
      this.canvas.innerHTML = this.units.map(function (c) {
        return '<span class=\'LinesEllipsis-unit\'>' + c + '</span>';
      }).join('');
      var ellipsisIndex = this.putEllipsis(this.calcIndexes());
      var clamped = ellipsisIndex > -1;
      this.setState({
        clamped: clamped,
        text: clamped ? this.units.slice(0, ellipsisIndex).join('') : props.text
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
      var lastIndex = indexes[this.maxLine];
      var units = this.units.slice(0, lastIndex);
      var maxOffsetTop = this.canvas.children[lastIndex].offsetTop;
      this.canvas.innerHTML = units.map(function (c, i) {
        return '<span class=\'LinesEllipsis-unit\'>' + c + '</span>';
      }).join('') + ('<wbr><span class=\'LinesEllipsis-ellipsis\'>' + this.props.ellipsis + '</span>');

      var ndEllipsis = this.canvas.lastElementChild;
      var ndPrevUnit = prevSibling(ndEllipsis, 2);
      while (ndPrevUnit && (ndEllipsis.offsetTop > maxOffsetTop || // IE & Edge: doesn't support <wbr>
      ndEllipsis.offsetHeight > ndPrevUnit.offsetHeight || ndEllipsis.offsetTop > ndPrevUnit.offsetTop)) {
        this.canvas.removeChild(ndPrevUnit);
        ndPrevUnit = prevSibling(ndEllipsis, 2);
        units.pop();
      }
      return units.length;
    }

    // expose

  }, {
    key: 'isClamped',
    value: function isClamped() {
      return this.state.clamped;
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      var _state = this.state,
          text = _state.text,
          clamped = _state.clamped;
      var _props = this.props,
          Component = _props.component,
          ellipsis = _props.ellipsis,
          trimRight = _props.trimRight,
          className = _props.className;

      return React.createElement(
        Component,
        {
          className: 'LinesEllipsis ' + (clamped ? 'LinesEllipsis--clamped' : '') + ' ' + className,
          ref: function ref(node) {
            return _this3.target = node;
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
}(React.PureComponent);

LinesEllipsis.defaultProps = {
  component: 'div',
  text: '',
  maxLine: 1,
  ellipsis: '…', // &hellip;
  trimRight: true,
  className: ''
};

module.exports = LinesEllipsis;

