'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');

var _require = require('./common'),
    canvasStyle = _require.canvasStyle,
    mirrorProps = _require.mirrorProps;

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

/**
 * props.unsafeHTML {String} the rich content you want to clamp
 * props.maxLine {Number|String} max lines allowed
 * props.ellipsis {String} the ellipsis indicator
 * props.basedOn {String} letters|words
 * props.className {String}
 */

var HTMLEllipsis = function (_React$PureComponent) {
  _inherits(HTMLEllipsis, _React$PureComponent);

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
      this.maxLine = +props.maxLine || 1;
      this.canvas.innerHTML = props.unsafeHTML;
      var basedOn = props.basedOn || /^[\x00-\x7F]+$/.test(props.unsafeHTML) ? 'words' : 'letters';
      hookNode(this.canvas, basedOn);
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
      var frag = document.createElement('span');
      frag.appendChild(document.createElement('wbr'));
      var ndEllipsis = document.createElement('span');
      ndEllipsis.className = 'LinesEllipsis-ellipsis';
      ndEllipsis.textContent = this.props.ellipsis;
      frag.appendChild(ndEllipsis);
      return frag;
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
          html = _state.html,
          clamped = _state.clamped;
      var _props = this.props,
          Component = _props.component,
          className = _props.className,
          unsafeHTML = _props.unsafeHTML;

      return React.createElement(
        Component,
        {
          className: 'LinesEllipsis ' + (clamped ? 'LinesEllipsis--clamped' : '') + ' ' + className,
          ref: function ref(node) {
            return _this3.target = node;
          }
        },
        React.createElement('div', { dangerouslySetInnerHTML: { __html: clamped ? html : unsafeHTML } })
      );
    }
  }]);

  return HTMLEllipsis;
}(React.PureComponent);

HTMLEllipsis.defaultProps = {
  component: 'div',
  unsafeHTML: '',
  maxLine: 1,
  ellipsis: '…', // &hellip;
  className: ''
};

module.exports = HTMLEllipsis;

