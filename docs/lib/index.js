var React = require('react');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function (n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
function _inheritsLoose(t, o) {
  t.prototype = Object.create(o.prototype), t.prototype.constructor = t, _setPrototypeOf(t, o);
}
function _objectWithoutPropertiesLoose(r, e) {
  if (null == r) return {};
  var t = {};
  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
    if (-1 !== e.indexOf(n)) continue;
    t[n] = r[n];
  }
  return t;
}
function _setPrototypeOf(t, e) {
  return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) {
    return t.__proto__ = e, t;
  }, _setPrototypeOf(t, e);
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

var _excluded = ["component", "ellipsis", "trimRight", "className"];
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
var LinesEllipsis = /*#__PURE__*/function (_React$PureComponent) {
  function LinesEllipsis(props) {
    var _this;
    _this = _React$PureComponent.call(this, props) || this;
    _this.state = {
      text: props.text,
      clamped: false
    };
    _this.units = [];
    _this.maxLine = 0;
    _this.canvas = null;
    return _this;
  }
  _inheritsLoose(LinesEllipsis, _React$PureComponent);
  var _proto = LinesEllipsis.prototype;
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
    if (this.canvas) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.canvas = null;
    }
  };
  _proto.setState = function setState(state, callback) {
    if (typeof state.clamped !== 'undefined') {
      this.clamped = state.clamped;
    }
    return _React$PureComponent.prototype.setState.call(this, state, callback);
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
    var basedOn = props.basedOn || (/^[\x00-\x7F]+$/.test(props.text) ? 'words' : 'letters');
    switch (basedOn) {
      case 'words':
        this.units = props.text.split(/\b|(?=\W)/);
        break;
      case 'letters':
        this.units = Array.from(props.text);
        break;
      default:
        throw new Error("Unsupported options basedOn: " + basedOn);
    }
    this.maxLine = +props.maxLine || 1;
    this.canvas.innerHTML = this.units.map(function (c) {
      return "<span class='LinesEllipsis-unit'>" + c + "</span>";
    }).join('');
    var ellipsisIndex = this.putEllipsis(this.calcIndexes());
    var clamped = ellipsisIndex > -1;
    var newState = {
      clamped: clamped,
      text: clamped ? this.units.slice(0, ellipsisIndex).join('') : props.text
    };
    this.setState(newState, props.onReflow.bind(this, newState));
  };
  _proto.calcIndexes = function calcIndexes() {
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
  };
  _proto.putEllipsis = function putEllipsis(indexes) {
    if (indexes.length <= this.maxLine) return -1;
    var lastIndex = indexes[this.maxLine];
    var units = this.units.slice(0, lastIndex);
    var maxOffsetTop = this.canvas.children[lastIndex].offsetTop;
    this.canvas.innerHTML = units.map(function (c, _i) {
      return "<span class='LinesEllipsis-unit'>" + c + "</span>";
    }).join('') + ("<wbr><span class='LinesEllipsis-ellipsis'>" + this.props.ellipsis + "</span>");
    var ndEllipsis = this.canvas.lastElementChild;
    var ndPrevUnit = prevSibling(ndEllipsis, 2);
    while (ndPrevUnit && (ndEllipsis.offsetTop > maxOffsetTop ||
    // IE & Edge: doesn't support <wbr>
    ndEllipsis.offsetHeight > ndPrevUnit.offsetHeight || ndEllipsis.offsetTop > ndPrevUnit.offsetTop)) {
      this.canvas.removeChild(ndPrevUnit);
      ndPrevUnit = prevSibling(ndEllipsis, 2);
      units.pop();
    }
    return units.length;
  }

  // expose
  ;
  _proto.isClamped = function isClamped() {
    return this.clamped; // do not use state.clamped. #27
  };
  _proto.render = function render() {
    var _this3 = this;
    var _this$state = this.state,
      text = _this$state.text,
      clamped = _this$state.clamped;
    var _this$props = this.props,
      Component = _this$props.component,
      ellipsis = _this$props.ellipsis,
      trimRight = _this$props.trimRight,
      className = _this$props.className,
      rest = _objectWithoutPropertiesLoose(_this$props, _excluded);
    return /*#__PURE__*/React__default['default'].createElement(Component, _extends({
      className: "LinesEllipsis " + (clamped ? 'LinesEllipsis--clamped' : '') + " " + className,
      ref: function ref(node) {
        return _this3.target = node;
      }
    }, omit(rest, usedProps)), clamped && trimRight ? text.replace(/[\s\uFEFF\xA0]+$/, '') : text, /*#__PURE__*/React__default['default'].createElement("wbr", null), clamped && /*#__PURE__*/React__default['default'].createElement("span", {
      className: "LinesEllipsis-ellipsis"
    }, ellipsis));
  };
  return LinesEllipsis;
}(React__default['default'].PureComponent);
LinesEllipsis.defaultProps = defaultProps;

module.exports = LinesEllipsis;
