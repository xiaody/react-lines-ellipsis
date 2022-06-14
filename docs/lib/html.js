var React = require('react');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };
  return _extends.apply(this, arguments);
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;

  _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return _setPrototypeOf(o, p);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

var canvasStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  height: 0,
  overflow: 'hidden',
  'padding-top': 0,
  'padding-bottom': 0,
  border: 'none'
};
var mirrorProps = ['box-sizing', 'width', 'font-size', 'font-weight', 'font-family', 'font-style', 'letter-spacing', 'text-indent', 'white-space', 'word-break', 'overflow-wrap', 'padding-left', 'padding-right'];

function omit(obj, omittedKeys) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  var ret = {};
  Object.keys(obj).forEach(function (key) {
    if (omittedKeys.indexOf(key) > -1) {
      return;
    }

    ret[key] = obj[key];
  });
  return ret;
}

var _excluded = ["component", "className", "unsafeHTML"];

function hookNode(node, basedOn) {
  /* eslint-env browser */
  if (basedOn !== 'letters' && basedOn !== 'words') {
    throw new Error("Unsupported options basedOn: " + basedOn);
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

var HTMLEllipsis = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(HTMLEllipsis, _React$Component);

  function HTMLEllipsis(props) {
    var _this;

    _this = _React$Component.call(this, props) || this;
    _this.state = {
      html: props.unsafeHTML,
      clamped: false
    };
    _this.canvas = null;
    _this.maxLine = 0;
    _this.nlUnits = [];
    return _this;
  }

  var _proto = HTMLEllipsis.prototype;

  _proto.componentDidMount = function componentDidMount() {
    this.initCanvas();
    this.reflow(this.props);
  };

  _proto.componentDidUpdate = function componentDidUpdate(prevProps) {
    if (prevProps.winWidth !== this.props.winWidth) {
      this.copyStyleToCanvas();
    }

    if (this.props !== prevProps) {
      this.reflow(this.props);
    }
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    this.canvas.parentNode.removeChild(this.canvas);
    this.canvas = null;
  };

  _proto.setState = function setState(state, callback) {
    if (typeof state.clamped !== 'undefined') {
      this.clamped = state.clamped;
    }

    return _React$Component.prototype.setState.call(this, state, callback);
  };

  _proto.initCanvas = function initCanvas() {
    if (this.canvas) return;
    var canvas = this.canvas = document.createElement('div');
    canvas.className = "LinesEllipsis-canvas " + this.props.className;
    canvas.setAttribute('aria-hidden', 'true');
    this.copyStyleToCanvas();
    Object.keys(canvasStyle).forEach(function (key) {
      canvas.style[key] = canvasStyle[key];
    });
    document.body.appendChild(canvas);
  };

  _proto.copyStyleToCanvas = function copyStyleToCanvas() {
    var _this2 = this;

    var targetStyle = window.getComputedStyle(this.target);
    mirrorProps.forEach(function (key) {
      _this2.canvas.style[key] = targetStyle[key];
    });
  };

  _proto.reflow = function reflow(props) {
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
  };

  _proto.calcIndexes = function calcIndexes() {
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
  };

  _proto.putEllipsis = function putEllipsis(indexes) {
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
  };

  _proto.makeEllipsisSpan = function makeEllipsisSpan() {
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
  ;

  _proto.isClamped = function isClamped() {
    return this.clamped; // do not use state.clamped. #27
  };

  _proto.render = function render() {
    var _this3 = this;

    var _this$state = this.state,
        html = _this$state.html,
        clamped = _this$state.clamped;

    var _this$props2 = this.props,
        Component = _this$props2.component,
        className = _this$props2.className,
        unsafeHTML = _this$props2.unsafeHTML,
        rest = _objectWithoutPropertiesLoose(_this$props2, _excluded);

    return /*#__PURE__*/React__default["default"].createElement(Component, _extends({
      className: "LinesEllipsis " + (clamped ? 'LinesEllipsis--clamped' : '') + " " + className,
      ref: function ref(node) {
        return _this3.target = node;
      }
    }, omit(rest, usedProps)), /*#__PURE__*/React__default["default"].createElement("div", {
      dangerouslySetInnerHTML: {
        __html: clamped ? html : unsafeHTML
      }
    }));
  };

  return HTMLEllipsis;
}(React__default["default"].Component);

HTMLEllipsis.defaultProps = defaultProps;

module.exports = HTMLEllipsis;
