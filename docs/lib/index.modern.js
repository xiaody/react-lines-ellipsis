import React from '../_snowpack/pkg/react.js';

function _extends() {
  _extends = Object.assign || function (target) {
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

const canvasStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  height: 0,
  overflow: 'hidden',
  'padding-top': 0,
  'padding-bottom': 0,
  border: 'none'
};
const mirrorProps = ['box-sizing', 'width', 'font-size', 'font-weight', 'font-family', 'font-style', 'letter-spacing', 'text-indent', 'white-space', 'word-break', 'overflow-wrap', 'padding-left', 'padding-right'];

function omit(obj, omittedKeys) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const ret = {};
  Object.keys(obj).forEach(key => {
    if (omittedKeys.indexOf(key) > -1) {
      return;
    }

    ret[key] = obj[key];
  });
  return ret;
}

function prevSibling(node, count) {
  while (node && count--) {
    node = node.previousElementSibling;
  }

  return node;
}

const defaultProps = {
  basedOn: undefined,
  className: '',
  component: 'div',
  ellipsis: '…',
  // &hellip;
  maxLine: 1,

  onReflow() {},

  text: '',
  trimRight: true,
  winWidth: undefined // for the HOC

};
const usedProps = Object.keys(defaultProps);
/**
 * props.text {String} the text you want to clamp
 * props.maxLine {Number|String} max lines allowed
 * props.ellipsis {String} the ellipsis indicator
 * props.trimRight {Boolean} should we trimRight the clamped text?
 * props.basedOn {String} letters|words
 * props.className {String}
 */

class LinesEllipsis extends React.Component {
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
    this.canvas.parentNode.removeChild(this.canvas);
  }

  setState(state, callback) {
    if (typeof state.clamped !== 'undefined') {
      this.clamped = state.clamped;
    }

    return super.setState(state, callback);
  }

  initCanvas() {
    if (this.canvas) return;
    const canvas = this.canvas = document.createElement('div');
    canvas.className = `LinesEllipsis-canvas ${this.props.className}`;
    canvas.setAttribute('aria-hidden', 'true');
    this.copyStyleToCanvas();
    Object.keys(canvasStyle).forEach(key => {
      canvas.style[key] = canvasStyle[key];
    });
    document.body.appendChild(canvas);
  }

  copyStyleToCanvas() {
    const targetStyle = window.getComputedStyle(this.target);
    mirrorProps.forEach(key => {
      this.canvas.style[key] = targetStyle[key];
    });
  }

  reflow(props) {
    /* eslint-disable no-control-regex */
    const basedOn = props.basedOn || (/^[\x00-\x7F]+$/.test(props.text) ? 'words' : 'letters');

    switch (basedOn) {
      case 'words':
        this.units = props.text.split(/\b|(?=\W)/);
        break;

      case 'letters':
        this.units = Array.from(props.text);
        break;

      default:
        throw new Error(`Unsupported options basedOn: ${basedOn}`);
    }

    this.maxLine = +props.maxLine || 1;
    this.canvas.innerHTML = this.units.map(c => {
      return `<span class='LinesEllipsis-unit'>${c}</span>`;
    }).join('');
    const ellipsisIndex = this.putEllipsis(this.calcIndexes());
    const clamped = ellipsisIndex > -1;
    const newState = {
      clamped,
      text: clamped ? this.units.slice(0, ellipsisIndex).join('') : props.text
    };
    this.setState(newState, props.onReflow.bind(this, newState));
  }

  calcIndexes() {
    const indexes = [0];
    let elt = this.canvas.firstElementChild;
    if (!elt) return indexes;
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
    if (indexes.length <= this.maxLine) return -1;
    const lastIndex = indexes[this.maxLine];
    const units = this.units.slice(0, lastIndex);
    const maxOffsetTop = this.canvas.children[lastIndex].offsetTop;
    this.canvas.innerHTML = units.map((c, i) => {
      return `<span class='LinesEllipsis-unit'>${c}</span>`;
    }).join('') + `<wbr><span class='LinesEllipsis-ellipsis'>${this.props.ellipsis}</span>`;
    const ndEllipsis = this.canvas.lastElementChild;
    let ndPrevUnit = prevSibling(ndEllipsis, 2);

    while (ndPrevUnit && (ndEllipsis.offsetTop > maxOffsetTop || // IE & Edge: doesn't support <wbr>
    ndEllipsis.offsetHeight > ndPrevUnit.offsetHeight || ndEllipsis.offsetTop > ndPrevUnit.offsetTop)) {
      this.canvas.removeChild(ndPrevUnit);
      ndPrevUnit = prevSibling(ndEllipsis, 2);
      units.pop();
    }

    return units.length;
  } // expose


  isClamped() {
    return this.clamped; // do not use state.clamped. #27
  }

  render() {
    const {
      text,
      clamped
    } = this.state;

    const _this$props = this.props,
          {
      component: Component,
      ellipsis,
      trimRight,
      className
    } = _this$props,
          rest = _objectWithoutPropertiesLoose(_this$props, ["component", "ellipsis", "trimRight", "className"]);

    return /*#__PURE__*/React.createElement(Component, _extends({
      className: `LinesEllipsis ${clamped ? 'LinesEllipsis--clamped' : ''} ${className}`,
      ref: node => this.target = node
    }, omit(rest, usedProps)), clamped && trimRight ? text.replace(/[\s\uFEFF\xA0]+$/, '') : text, /*#__PURE__*/React.createElement("wbr", null), clamped && /*#__PURE__*/React.createElement("span", {
      className: "LinesEllipsis-ellipsis"
    }, ellipsis));
  }

}

LinesEllipsis.defaultProps = defaultProps;

export default LinesEllipsis;
