'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');

var _require = require('./common'),
    canvasStyle = _require.canvasStyle,
    mirrorProps = _require.mirrorProps;

function dummySpan(text) {
  var span = document.createElement('span');
  span.className = 'LinesEllipsis-char';
  span.textContent = text;
  return span;
}

function hookNode(node) {
  /* eslint-env browser */
  if (node.nodeType === Node.TEXT_NODE) {
    (function () {
      var frag = document.createDocumentFragment();
      Array.from(node.textContent).forEach(function (cha) {
        frag.appendChild(dummySpan(cha));
      });
      node.parentNode.replaceChild(frag, node);
    })();
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    var nodes = [].slice.call(node.childNodes);
    var len = nodes.length;
    for (var i = 0; i < len; i++) {
      hookNode(nodes[i]);
    }
  }
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

/**
 * props.unsafeHTML {String} the rich content you want to clamp
 * props.maxLine {Number|String} max lines allowed
 * props.ellipsis {String} the ellipsis indicator
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
    _this.nlChars = [];
    return _this;
  }

  _createClass(HTMLEllipsis, [{
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
      mirrorProps.forEach(function (key) {
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
      this.maxLine = +props.maxLine || 1;
      this.canvas.innerHTML = props.unsafeHTML;
      hookNode(this.canvas);
      var clamped = this.putEllipsis(this.calcIndexes());
      this.setState({ clamped: clamped });
      if (clamped) {
        this.setState({ html: this.canvas.innerHTML });
      }
    }
  }, {
    key: 'calcIndexes',
    value: function calcIndexes() {
      var indexes = [0];
      var nlChars = this.nlChars = Array.from(this.canvas.querySelectorAll('.LinesEllipsis-char'));
      var len = nlChars.length;
      if (!nlChars.length) return indexes;

      var line = 1;
      var offsetTop = nlChars[0].offsetTop;
      for (var i = 1; i < len; i++) {
        if (nlChars[i].offsetHeight && nlChars[i].offsetTop > offsetTop) {
          line++;
          indexes.push(i);
          offsetTop = nlChars[i].offsetTop;
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
      this.nlChars = this.nlChars.slice(0, indexes[this.maxLine]);
      var ndPrevChar = this.nlChars.pop();
      removeFollowingElementLeaves(ndPrevChar, this.canvas);
      var ndEllipsis = this.makeEllipsisSpan();
      findBlockAncestor(ndPrevChar).appendChild(ndEllipsis);

      while (ndPrevChar && (ndEllipsis.offsetHeight > ndPrevChar.offsetHeight || ndEllipsis.offsetTop > ndPrevChar.offsetTop)) {
        ndPrevChar = this.nlChars.pop();
        removeFollowingElementLeaves(ndPrevChar, this.canvas);
        findBlockAncestor(ndPrevChar).appendChild(ndEllipsis);
      }
      this.nlChars.forEach(unwrapTextNode);

      return true;
    }
  }, {
    key: 'makeEllipsisSpan',
    value: function makeEllipsisSpan() {
      var frag = document.createElement('span');
      frag.appendChild(document.createElement('wbr'));
      var ndEllipsis = document.createElement('span');
      ndEllipsis.className = 'LinesEllipsis-ellipsis';
      ndEllipsis.textContent = this.props.ellipsis;
      frag.appendChild(ndEllipsis);
      return frag;
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _state = this.state,
          html = _state.html,
          clamped = _state.clamped;
      var _props = this.props,
          className = _props.className,
          unsafeHTML = _props.unsafeHTML;

      return React.createElement(
        'div',
        {
          className: 'LinesEllipsis ' + (clamped ? 'LinesEllipsis--clamped' : '') + ' ' + className,
          ref: function ref(node) {
            return _this2.target = node;
          }
        },
        React.createElement('div', { dangerouslySetInnerHTML: { __html: clamped ? html : unsafeHTML } })
      );
    }
  }]);

  return HTMLEllipsis;
}(React.Component);

HTMLEllipsis.defaultProps = {
  html: '',
  maxLine: 1,
  ellipsis: '…', // &hellip;
  className: ''
};

module.exports = HTMLEllipsis;

