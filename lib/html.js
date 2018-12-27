'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');

var _require = require('./common'),
    canvasStyle = _require.canvasStyle,
    mirrorProps = _require.mirrorProps;

var _require2 = require('./helpers'),
    omit = _require2.omit;

function hookNode(node, basedOn) {
  /* eslint-env browser */
  if (basedOn !== 'letters' && basedOn !== 'words') {
    throw new Error('Unsupported options basedOn: ' + basedOn);
  }
  if (node.nodeType === Node.TEXT_NODE) {
    var frag = document.createDocumentFragment();
    var units = void 0;
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
  ellipsis: '…', // &hellip;
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

var HTMLEllipsis = function (_React$Component) {
  _inherits(HTMLEllipsis, _React$Component);

  function HTMLEllipsis(props) {
    _classCallCheck(this, HTMLEllipsis);

    var _this = _possibleConstructorReturn(this, (HTMLEllipsis.__proto__ || Object.getPrototypeOf(HTMLEllipsis)).call(this, props));

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
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.initCanvas();
      this.reflow(this.props);
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      if (prevProps.winWidth !== this.props.winWidth) {
        this.copyStyleToCanvas();
      }
      if (this.props !== prevProps) {
        this.reflow(this.props);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }, {
    key: 'setState',
    value: function setState(state, callback) {
      if (typeof state.clamped !== 'undefined') {
        this.clamped = state.clamped;
      }
      return _get(HTMLEllipsis.prototype.__proto__ || Object.getPrototypeOf(HTMLEllipsis.prototype), 'setState', this).call(this, state, callback);
    }
  }, {
    key: 'initCanvas',
    value: function initCanvas() {
      if (this.canvas) return;
      var canvas = this.canvas = document.createElement('div');
      canvas.className = 'LinesEllipsis-canvas ' + this.props.className;
      canvas.setAttribute('aria-hidden', 'true');
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
    key: 'calcIndexes',
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
    key: 'putEllipsis',
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
    key: 'makeEllipsisSpan',
    value: function makeEllipsisSpan() {
      var _props = this.props,
          ellipsisHTML = _props.ellipsisHTML,
          ellipsis = _props.ellipsis;

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
    }

    // expose

  }, {
    key: 'isClamped',
    value: function isClamped() {
      return this.clamped; // do not use state.clamped. #27
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      var _state = this.state,
          html = _state.html,
          clamped = _state.clamped;

      var _props2 = this.props,
          Component = _props2.component,
          className = _props2.className,
          unsafeHTML = _props2.unsafeHTML,
          rest = _objectWithoutProperties(_props2, ['component', 'className', 'unsafeHTML']);

      return React.createElement(
        Component,
        _extends({
          className: 'LinesEllipsis ' + (clamped ? 'LinesEllipsis--clamped' : '') + ' ' + className,
          ref: function ref(node) {
            return _this3.target = node;
          }
        }, omit(rest, usedProps)),
        React.createElement('div', { dangerouslySetInnerHTML: { __html: clamped ? html : unsafeHTML } })
      );
    }
  }]);

  return HTMLEllipsis;
}(React.Component);

HTMLEllipsis.defaultProps = defaultProps;

module.exports = HTMLEllipsis;

