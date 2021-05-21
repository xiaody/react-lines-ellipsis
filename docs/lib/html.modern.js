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

function hookNode(node, basedOn) {
  /* eslint-env browser */
  if (basedOn !== 'letters' && basedOn !== 'words') {
    throw new Error(`Unsupported options basedOn: ${basedOn}`);
  }

  if (node.nodeType === Node.TEXT_NODE) {
    const frag = document.createDocumentFragment();
    let units;

    switch (basedOn) {
      case 'words':
        units = node.textContent.split(/\b|(?=\W)/);
        break;

      case 'letters':
        units = Array.from(node.textContent);
        break;
    }

    units.forEach(unit => {
      frag.appendChild(dummySpan(unit));
    });
    node.parentNode.replaceChild(frag, node);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const nodes = [].slice.call(node.childNodes);
    const len = nodes.length;

    for (let i = 0; i < len; i++) {
      hookNode(nodes[i], basedOn);
    }
  }
}

function dummySpan(text) {
  const span = document.createElement('span');
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
  let ndAncestor = node;

  while (ndAncestor = ndAncestor.parentNode) {
    if (/p|div|main|section|h\d|ul|ol|li/.test(ndAncestor.tagName.toLowerCase())) {
      return ndAncestor;
    }
  }
}

function affectLayout(ndUnit) {
  return !!(ndUnit.offsetHeight && (ndUnit.offsetWidth || /\S/.test(ndUnit.textContent)));
}

const defaultProps = {
  component: 'div',
  unsafeHTML: '',
  maxLine: 1,
  ellipsis: '…',
  // &hellip;
  ellipsisHTML: undefined,
  className: '',
  basedOn: undefined,

  onReflow() {},

  winWidth: undefined // for the HOC

};
const usedProps = Object.keys(defaultProps);
/**
 * props.unsafeHTML {String} the rich content you want to clamp
 * props.maxLine {Number|String} max lines allowed
 * props.ellipsis {String} the ellipsis indicator
 * props.basedOn {String} letters|words
 * props.className {String}
 */

class HTMLEllipsis extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      html: props.unsafeHTML,
      clamped: false
    };
    this.canvas = null;
    this.maxLine = 0;
    this.nlUnits = [];
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
    this.maxLine = +props.maxLine || 1;
    this.canvas.innerHTML = props.unsafeHTML;
    const basedOn = props.basedOn || (/^[\x00-\x7F]+$/.test(props.unsafeHTML) ? 'words' : 'letters');
    hookNode(this.canvas, basedOn);
    const clamped = this.putEllipsis(this.calcIndexes());
    const newState = {
      clamped,
      html: this.canvas.innerHTML
    };
    this.setState(newState, props.onReflow.bind(this, newState));
  }

  calcIndexes() {
    const indexes = [0];
    const nlUnits = this.nlUnits = Array.from(this.canvas.querySelectorAll('.LinesEllipsis-unit'));
    const len = nlUnits.length;
    if (!nlUnits.length) return indexes;
    const nd1stLayoutUnit = nlUnits.find(affectLayout);
    if (!nd1stLayoutUnit) return indexes;
    let line = 1;
    let offsetTop = nd1stLayoutUnit.offsetTop;

    for (let i = 1; i < len; i++) {
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

  putEllipsis(indexes) {
    if (indexes.length <= this.maxLine) return false;
    this.nlUnits = this.nlUnits.slice(0, indexes[this.maxLine]);
    let ndPrevUnit = this.nlUnits.pop();
    const ndEllipsis = this.makeEllipsisSpan();

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

  makeEllipsisSpan() {
    const {
      ellipsisHTML,
      ellipsis
    } = this.props;
    const frag = document.createElement('span');
    frag.appendChild(document.createElement('wbr'));
    const ndEllipsis = document.createElement('span');
    ndEllipsis.className = 'LinesEllipsis-ellipsis';

    if (ellipsisHTML) {
      ndEllipsis.innerHTML = ellipsisHTML;
    } else {
      ndEllipsis.textContent = ellipsis;
    }

    frag.appendChild(ndEllipsis);
    return frag;
  } // expose


  isClamped() {
    return this.clamped; // do not use state.clamped. #27
  }

  render() {
    const {
      html,
      clamped
    } = this.state;

    const _this$props = this.props,
          {
      component: Component,
      className,
      unsafeHTML
    } = _this$props,
          rest = _objectWithoutPropertiesLoose(_this$props, ["component", "className", "unsafeHTML"]);

    return /*#__PURE__*/React.createElement(Component, _extends({
      className: `LinesEllipsis ${clamped ? 'LinesEllipsis--clamped' : ''} ${className}`,
      ref: node => this.target = node
    }, omit(rest, usedProps)), /*#__PURE__*/React.createElement("div", {
      dangerouslySetInnerHTML: {
        __html: clamped ? html : unsafeHTML
      }
    }));
  }

}

HTMLEllipsis.defaultProps = defaultProps;

export default HTMLEllipsis;
