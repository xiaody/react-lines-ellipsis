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

function hookNode(node, basedOn) {
  /* eslint-env browser */
  if (basedOn !== 'letters' && basedOn !== 'words') {
    throw new Error("Unsupported options basedOn: ".concat(basedOn));
  }

  if (node.nodeType === Node.TEXT_NODE) {
    var frag = document.createDocumentFragment();
    var units;

    switch (basedOn) {
      case 'words':
        units = node.textContent.split(/\b|(?=\W)/);
        break;

      case 'letters':
        units = Array.from(node.textContent);
        break;
    }

    units.forEach(function (unit) {
      frag.appendChild(dummySpan(unit));
    });
    node.parentNode.replaceChild(frag, node);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    var nodes = [].slice.call(node.childNodes);
    var len = nodes.length;

    for (var i = 0; i < len; i++) {
      hookNode(nodes[i], basedOn);
    }
  }
}

function dummySpan(text) {
  var span = document.createElement('span');
  span.className = 'LinesEllipsis-unit';
  span.textContent = text;
  return span;
}

function unwrapTextNode(node) {
  node.parentNode.replaceChild(document.createTextNode(node.textContent), node);
}

function removeFollowingElementLeaves(node, root) {
  if (!root.contains(node) || node === root) return;

  while (node.nextElementSibling) {
    node.parentNode.removeChild(node.nextElementSibling);
  }

  removeFollowingElementLeaves(node.parentNode, root);
}

function findBlockAncestor(node) {
  var ndAncestor = node;

  while (ndAncestor = ndAncestor.parentNode) {
    if (/p|div|main|section|h\d|ul|ol|li/.test(ndAncestor.tagName.toLowerCase())) {
      return ndAncestor;
    }
  }
}

function affectLayout(ndUnit) {
  return !!(ndUnit.offsetHeight && (ndUnit.offsetWidth || /\S/.test(ndUnit.textContent)));
}

var defaultProps = {
  component: 'div',
  unsafeHTML: '',
  maxLine: 1,
  ellipsis: '…',
  // &hellip;
  ellipsisHTML: undefined,
  className: '',
  basedOn: undefined,
  onReflow: function onReflow() {},
  winWidth: undefined // for the HOC

};
var usedProps = Object.keys(defaultProps);
/**
 * props.unsafeHTML {String} the rich content you want to clamp
 * props.maxLine {Number|String} max lines allowed
 * props.ellipsis {String} the ellipsis indicator
 * props.basedOn {String} letters|words
 * props.className {String}
 */

var HTMLEllipsis =
/*#__PURE__*/
function (_React$Component) {
  _inherits(HTMLEllipsis, _React$Component);

  function HTMLEllipsis(props) {
    var _this;

    _classCallCheck(this, HTMLEllipsis);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(HTMLEllipsis).call(this, props));
    _this.state = {
      html: props.unsafeHTML,
      clamped: false
    };
    _this.canvas = null;
    _this.maxLine = 0;
    _this.nlUnits = [];
    return _this;
  }

  _createClass(HTMLEllipsis, [{
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

      return _get(_getPrototypeOf(HTMLEllipsis.prototype), "setState", this).call(this, state, callback);
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
      this.maxLine = +props.maxLine || 1;
      this.canvas.innerHTML = props.unsafeHTML;
      var basedOn = props.basedOn || (/^[\x00-\x7F]+$/.test(props.unsafeHTML) ? 'words' : 'letters');
      hookNode(this.canvas, basedOn);
      var clamped = this.putEllipsis(this.calcIndexes());
      var newState = {
        clamped: clamped,
        html: this.canvas.innerHTML
      };
      this.setState(newState, props.onReflow.bind(this, newState));
    }
  }, {
    key: "calcIndexes",
    value: function calcIndexes() {
      var indexes = [0];
      var nlUnits = this.nlUnits = Array.from(this.canvas.querySelectorAll('.LinesEllipsis-unit'));
      var len = nlUnits.length;
      if (!nlUnits.length) return indexes;
      var nd1stLayoutUnit = nlUnits.find(affectLayout);
      if (!nd1stLayoutUnit) return indexes;
      var line = 1;
      var offsetTop = nd1stLayoutUnit.offsetTop;

      for (var i = 1; i < len; i++) {
        if (affectLayout(nlUnits[i]) && nlUnits[i].offsetTop - offsetTop > 1) {
          line++;
          indexes.push(i);
          offsetTop = nlUnits[i].offsetTop;

          if (line > this.maxLine) {
            break;
          }
        }
      }

      return indexes;
    }
  }, {
    key: "putEllipsis",
    value: function putEllipsis(indexes) {
      if (indexes.length <= this.maxLine) return false;
      this.nlUnits = this.nlUnits.slice(0, indexes[this.maxLine]);
      var ndPrevUnit = this.nlUnits.pop();
      var ndEllipsis = this.makeEllipsisSpan();

      do {
        removeFollowingElementLeaves(ndPrevUnit, this.canvas);
        findBlockAncestor(ndPrevUnit).appendChild(ndEllipsis);
        ndPrevUnit = this.nlUnits.pop();
      } while (ndPrevUnit && (!affectLayout(ndPrevUnit) || ndEllipsis.offsetHeight > ndPrevUnit.offsetHeight || ndEllipsis.offsetTop > ndPrevUnit.offsetTop));

      if (ndPrevUnit) {
        unwrapTextNode(ndPrevUnit);
      }

      this.nlUnits.forEach(unwrapTextNode);
      return true;
    }
  }, {
    key: "makeEllipsisSpan",
    value: function makeEllipsisSpan() {
      var _this$props = this.props,
          ellipsisHTML = _this$props.ellipsisHTML,
          ellipsis = _this$props.ellipsis;
      var frag = document.createElement('span');
      frag.appendChild(document.createElement('wbr'));
      var ndEllipsis = document.createElement('span');
      ndEllipsis.className = 'LinesEllipsis-ellipsis';

      if (ellipsisHTML) {
        ndEllipsis.innerHTML = ellipsisHTML;
      } else {
        ndEllipsis.textContent = ellipsis;
      }

      frag.appendChild(ndEllipsis);
      return frag;
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
          html = _this$state.html,
          clamped = _this$state.clamped;

      var _this$props2 = this.props,
          Component = _this$props2.component,
          className = _this$props2.className,
          unsafeHTML = _this$props2.unsafeHTML,
          rest = _objectWithoutProperties(_this$props2, ["component", "className", "unsafeHTML"]);

      return React.createElement(Component, _extends({
        className: "LinesEllipsis ".concat(clamped ? 'LinesEllipsis--clamped' : '', " ").concat(className),
        ref: function ref(node) {
          return _this3.target = node;
        }
      }, omit(rest, usedProps)), React.createElement("div", {
        dangerouslySetInnerHTML: {
          __html: clamped ? html : unsafeHTML
        }
      }));
    }
  }]);

  return HTMLEllipsis;
}(React.Component);

HTMLEllipsis.defaultProps = defaultProps;
module.exports = HTMLEllipsis;

