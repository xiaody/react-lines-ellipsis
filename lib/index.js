"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var React = require('react');

var _require = require('./common'),
    canvasStyle = _require.canvasStyle,
    mirrorProps = _require.mirrorProps;

var _require2 = require('./helpers'),
    omit = _require2.omit;

function prevSibling(node, count) {
  while (node && count--) {
    node = node.previousElementSibling;
  }

  return node;
}

var defaultProps = {
  basedOn: undefined,
  className: '',
  component: 'div',
  ellipsis: '…',
  // &hellip;
  maxLine: 1,
  onReflow: function onReflow() {},
  text: '',
  trimRight: true,
  winWidth: undefined // for the HOC

};
var usedProps = Object.keys(defaultProps);
/**
 * props.text {String} the text you want to clamp
 * props.maxLine {Number|String} max lines allowed
 * props.ellipsis {String} the ellipsis indicator
 * props.trimRight {Boolean} should we trimRight the clamped text?
 * props.basedOn {String} letters|words
 * props.className {String}
 */

var LinesEllipsis =
/*#__PURE__*/
function (_React$Component) {
  _inherits(LinesEllipsis, _React$Component);

  function LinesEllipsis(props) {
    var _this;

    _classCallCheck(this, LinesEllipsis);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(LinesEllipsis).call(this, props));
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
    key: "componentDidMount",
    value: function componentDidMount() {
      this.initCanvas();
      this.reflow(this.props);
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      if (prevProps.winWidth !== this.props.winWidth) {
        this.copyStyleToCanvas();
      }

      if (this.props !== prevProps) {
        this.reflow(this.props);
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }, {
    key: "setState",
    value: function setState(state, callback) {
      if (typeof state.clamped !== 'undefined') {
        this.clamped = state.clamped;
      }

      return _get(_getPrototypeOf(LinesEllipsis.prototype), "setState", this).call(this, state, callback);
    }
  }, {
    key: "initCanvas",
    value: function initCanvas() {
      if (this.canvas) return;
      var canvas = this.canvas = document.createElement('div');
      canvas.className = "LinesEllipsis-canvas ".concat(this.props.className);
      canvas.setAttribute('aria-hidden', 'true');
      this.copyStyleToCanvas();
      Object.keys(canvasStyle).forEach(function (key) {
        canvas.style[key] = canvasStyle[key];
      });
      document.body.appendChild(canvas);
    }
  }, {
    key: "copyStyleToCanvas",
    value: function copyStyleToCanvas() {
      var _this2 = this;

      var targetStyle = window.getComputedStyle(this.target);
      mirrorProps.forEach(function (key) {
        _this2.canvas.style[key] = targetStyle[key];
      });
    }
  }, {
    key: "reflow",
    value: function reflow(props) {
      /* eslint-disable no-control-regex */
      var basedOn = props.basedOn || (/^[\x00-\x7F]+$/.test(props.text) ? 'words' : 'letters');

      switch (basedOn) {
        case 'words':
          this.units = props.text.split(/\b|(?=\W)/);
          break;

        case 'letters':
          this.units = Array.from(props.text);
          break;

        default:
          throw new Error("Unsupported options basedOn: ".concat(basedOn));
      }

      this.maxLine = +props.maxLine || 1;
      this.canvas.innerHTML = this.units.map(function (c) {
        return "<span class='LinesEllipsis-unit'>".concat(c, "</span>");
      }).join('');
      var ellipsisIndex = this.putEllipsis(this.calcIndexes());
      var clamped = ellipsisIndex > -1;
      var newState = {
        clamped: clamped,
        text: clamped ? this.units.slice(0, ellipsisIndex).join('') : props.text
      };
      this.setState(newState, props.onReflow.bind(this, newState));
    }
  }, {
    key: "calcIndexes",
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
    key: "putEllipsis",
    value: function putEllipsis(indexes) {
      if (indexes.length <= this.maxLine) return -1;
      var lastIndex = indexes[this.maxLine];
      var units = this.units.slice(0, lastIndex);
      var maxOffsetTop = this.canvas.children[lastIndex].offsetTop;
      this.canvas.innerHTML = units.map(function (c, i) {
        return "<span class='LinesEllipsis-unit'>".concat(c, "</span>");
      }).join('') + "<wbr><span class='LinesEllipsis-ellipsis'>".concat(this.props.ellipsis, "</span>");
      var ndEllipsis = this.canvas.lastElementChild;
      var ndPrevUnit = prevSibling(ndEllipsis, 2);

      while (ndPrevUnit && (ndEllipsis.offsetTop > maxOffsetTop || // IE & Edge: doesn't support <wbr>
      ndEllipsis.offsetHeight > ndPrevUnit.offsetHeight || ndEllipsis.offsetTop > ndPrevUnit.offsetTop)) {
        this.canvas.removeChild(ndPrevUnit);
        ndPrevUnit = prevSibling(ndEllipsis, 2);
        units.pop();
      }

      return units.length;
    } // expose

  }, {
    key: "isClamped",
    value: function isClamped() {
      return this.clamped; // do not use state.clamped. #27
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var _this$state = this.state,
          text = _this$state.text,
          clamped = _this$state.clamped;

      var _this$props = this.props,
          Component = _this$props.component,
          ellipsis = _this$props.ellipsis,
          trimRight = _this$props.trimRight,
          className = _this$props.className,
          rest = _objectWithoutProperties(_this$props, ["component", "ellipsis", "trimRight", "className"]);

      return React.createElement(Component, _extends({
        className: "LinesEllipsis ".concat(clamped ? 'LinesEllipsis--clamped' : '', " ").concat(className),
        ref: function ref(node) {
          return _this3.target = node;
        }
      }, omit(rest, usedProps)), clamped && trimRight ? text.replace(/[\s\uFEFF\xA0]+$/, '') : text, React.createElement("wbr", null), clamped && React.createElement("span", {
        className: "LinesEllipsis-ellipsis"
      }, ellipsis));
    }
  }]);

  return LinesEllipsis;
}(React.Component);

LinesEllipsis.defaultProps = defaultProps;
module.exports = LinesEllipsis;

