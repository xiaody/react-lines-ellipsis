import React from "../_snowpack/pkg/react.js";
function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function(n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t)
        ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
function _objectWithoutPropertiesLoose(r, e) {
  if (r == null)
    return {};
  var t = {};
  for (var n in r)
    if ({}.hasOwnProperty.call(r, n)) {
      if (e.indexOf(n) !== -1)
        continue;
      t[n] = r[n];
    }
  return t;
}
const canvasStyle = {
  position: "absolute",
  bottom: 0,
  left: 0,
  height: 0,
  overflow: "hidden",
  "padding-top": 0,
  "padding-bottom": 0,
  border: "none"
};
const mirrorProps = ["box-sizing", "width", "font-size", "font-weight", "font-family", "font-style", "letter-spacing", "text-indent", "white-space", "word-break", "overflow-wrap", "padding-left", "padding-right"];
function omit(obj, omittedKeys) {
  if (!obj || typeof obj !== "object") {
    return obj;
  }
  const ret = {};
  Object.keys(obj).forEach((key) => {
    if (omittedKeys.indexOf(key) > -1) {
      return;
    }
    ret[key] = obj[key];
  });
  return ret;
}
const _excluded = ["component", "ellipsis", "trimRight", "className"];
function prevSibling(node, count) {
  while (node && count--) {
    node = node.previousElementSibling;
  }
  return node;
}
const defaultProps = {
  basedOn: void 0,
  className: "",
  component: "div",
  ellipsis: "…",
  maxLine: 1,
  onReflow() {
  },
  text: "",
  trimRight: true,
  winWidth: void 0
};
const usedProps = Object.keys(defaultProps);
class LinesEllipsis extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      text: props.text,
      clamped: false
    };
    this.units = [];
    this.maxLine = 0;
    this.canvas = null;
  }
  componentDidMount() {
    this.initCanvas();
    this.reflow(this.props);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.winWidth !== this.props.winWidth) {
      this.copyStyleToCanvas();
    }
    if (this.props !== prevProps) {
      this.reflow(this.props);
    }
  }
  componentWillUnmount() {
    if (this.canvas) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.canvas = null;
    }
  }
  setState(state, callback) {
    if (typeof state.clamped !== "undefined") {
      this.clamped = state.clamped;
    }
    return super.setState(state, callback);
  }
  initCanvas() {
    if (this.canvas)
      return;
    const canvas = this.canvas = document.createElement("div");
    canvas.className = `LinesEllipsis-canvas ${this.props.className}`;
    canvas.setAttribute("aria-hidden", "true");
    this.copyStyleToCanvas();
    Object.keys(canvasStyle).forEach((key) => {
      canvas.style[key] = canvasStyle[key];
    });
    document.body.appendChild(canvas);
  }
  copyStyleToCanvas() {
    const targetStyle = window.getComputedStyle(this.target);
    mirrorProps.forEach((key) => {
      this.canvas.style[key] = targetStyle[key];
    });
  }
  reflow(props) {
    const basedOn = props.basedOn || (/^[\x00-\x7F]+$/.test(props.text) ? "words" : "letters");
    switch (basedOn) {
      case "words":
        this.units = props.text.split(/\b|(?=\W)/);
        break;
      case "letters":
        this.units = Array.from(props.text);
        break;
      default:
        throw new Error(`Unsupported options basedOn: ${basedOn}`);
    }
    this.maxLine = +props.maxLine || 1;
    this.canvas.innerHTML = this.units.map((c) => {
      return `<span class='LinesEllipsis-unit'>${c}</span>`;
    }).join("");
    const ellipsisIndex = this.putEllipsis(this.calcIndexes());
    const clamped = ellipsisIndex > -1;
    const newState = {
      clamped,
      text: clamped ? this.units.slice(0, ellipsisIndex).join("") : props.text
    };
    this.setState(newState, props.onReflow.bind(this, newState));
  }
  calcIndexes() {
    const indexes = [0];
    let elt = this.canvas.firstElementChild;
    if (!elt)
      return indexes;
    let index = 0;
    let line = 1;
    let offsetTop = elt.offsetTop;
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
  putEllipsis(indexes) {
    if (indexes.length <= this.maxLine)
      return -1;
    const lastIndex = indexes[this.maxLine];
    const units = this.units.slice(0, lastIndex);
    const maxOffsetTop = this.canvas.children[lastIndex].offsetTop;
    this.canvas.innerHTML = units.map((c, _i) => {
      return `<span class='LinesEllipsis-unit'>${c}</span>`;
    }).join("") + `<wbr><span class='LinesEllipsis-ellipsis'>${this.props.ellipsis}</span>`;
    const ndEllipsis = this.canvas.lastElementChild;
    let ndPrevUnit = prevSibling(ndEllipsis, 2);
    while (ndPrevUnit && (ndEllipsis.offsetTop > maxOffsetTop || ndEllipsis.offsetHeight > ndPrevUnit.offsetHeight || ndEllipsis.offsetTop > ndPrevUnit.offsetTop)) {
      this.canvas.removeChild(ndPrevUnit);
      ndPrevUnit = prevSibling(ndEllipsis, 2);
      units.pop();
    }
    return units.length;
  }
  isClamped() {
    return this.clamped;
  }
  render() {
    const {
      text,
      clamped
    } = this.state;
    const _this$props = this.props, {
      component: Component,
      ellipsis,
      trimRight,
      className
    } = _this$props, rest = _objectWithoutPropertiesLoose(_this$props, _excluded);
    return /* @__PURE__ */ React.createElement(Component, _extends({
      className: `LinesEllipsis ${clamped ? "LinesEllipsis--clamped" : ""} ${className}`,
      ref: (node) => this.target = node
    }, omit(rest, usedProps)), clamped && trimRight ? text.replace(/[\s\uFEFF\xA0]+$/, "") : text, /* @__PURE__ */ React.createElement("wbr", null), clamped && /* @__PURE__ */ React.createElement("span", {
      className: "LinesEllipsis-ellipsis"
    }, ellipsis));
  }
}
LinesEllipsis.defaultProps = defaultProps;
export default LinesEllipsis;
