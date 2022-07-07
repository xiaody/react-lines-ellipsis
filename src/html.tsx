import * as React from "react";
import { canvasStyle, mirrorProps } from "./common";
import { omit } from "./helpers";

function hookNode(node: Node, basedOn: "letters" | "words") {
  /* eslint-env browser */
  if (basedOn !== "letters" && basedOn !== "words") {
    throw new Error(`Unsupported options basedOn: ${basedOn}`);
  }
  if (node.nodeType === Node.TEXT_NODE) {
    const frag = document.createDocumentFragment();
    let units: string[];
    switch (basedOn) {
      case "words":
        units = node.textContent.split(/\b|(?=\W)/);
        break;
      case "letters":
        units = Array.from(node.textContent);
        break;
    }
    units.forEach((unit) => {
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

function dummySpan(text: string) {
  const span = document.createElement("span");
  span.className = "LinesEllipsis-unit";
  span.textContent = text;
  return span;
}

function unwrapTextNode(node: Node) {
  node.parentNode.replaceChild(document.createTextNode(node.textContent), node);
}

function removeFollowingElementLeaves(node: HTMLElement, root: HTMLElement) {
  if (!root.contains(node) || node === root) return;
  while (node.nextElementSibling != null) {
    node.parentNode.removeChild(node.nextElementSibling);
  }
  removeFollowingElementLeaves(node.parentNode as HTMLElement, root);
}

function findBlockAncestor(node: HTMLElement) {
  let ndAncestor = node;
  while ((ndAncestor = ndAncestor.parentNode as HTMLElement)) {
    if (
      /p|div|main|section|h\d|ul|ol|li/.test(ndAncestor.tagName.toLowerCase())
    ) {
      return ndAncestor;
    }
  }
}

function affectLayout(ndUnit: HTMLElement): boolean {
  return !!(
    ndUnit.offsetHeight &&
    (ndUnit.offsetWidth || /\S/.test(ndUnit.textContent))
  );
}

const defaultProps = {
  component: "div",
  unsafeHTML: "",
  maxLine: 1,
  ellipsis: "…", // &hellip;
  ellipsisHTML: undefined,
  className: "",
  basedOn: undefined,
  onReflow() {},
  winWidth: undefined, // for the HOC
};
const usedProps = Object.keys(defaultProps);

interface HTMLEllipsisProps {
  basedOn?: "letters" | "words";
  className?: string;
  component?: string;
  ellipsis?: string;
  ellipsisHTML?: string;
  maxLine?: number;
  onReflow?: (state: HTMLEllipsisState) => void;
  unsafeHTML: string;
  winWidth?: number; // for the HOC
}

interface HTMLEllipsisState {
  html: string;
  clamped: boolean;
}

/**
 * props.unsafeHTML {String} the rich content you want to clamp
 * props.maxLine {Number|String} max lines allowed
 * props.ellipsis {String} the ellipsis indicator
 * props.basedOn {String} letters|words
 * props.className {String}
 */
class HTMLEllipsis extends React.Component<
  HTMLEllipsisProps,
  HTMLEllipsisState
> {
  static defaultProps = defaultProps;

  private nlUnits = [];
  private maxLine = 0;
  private canvas = null;
  private clamped = false;
  private target: HTMLElement;

  constructor(props: HTMLEllipsisProps) {
    super(props);
    this.state = {
      html: props.unsafeHTML,
      clamped: false,
    };
  }

  componentDidMount() {
    this.initCanvas();
    this.reflow(this.props);
  }

  componentDidUpdate(prevProps: HTMLEllipsisProps) {
    if (prevProps.winWidth !== this.props.winWidth) {
      this.copyStyleToCanvas();
    }
    if (this.props !== prevProps) {
      this.reflow(this.props);
    }
  }

  componentWillUnmount() {
    this.canvas.parentNode.removeChild(this.canvas);
    this.canvas = null;
  }

  setState(state: HTMLEllipsisState, callback: () => void) {
    if (typeof state.clamped !== "undefined") {
      this.clamped = state.clamped;
    }
    return super.setState(state, callback);
  }

  initCanvas() {
    if (this.canvas) return;
    const canvas = (this.canvas = document.createElement("div"));
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

  reflow(props: HTMLEllipsisProps) {
    /* eslint-disable no-control-regex */
    this.maxLine = +props.maxLine || 1;
    this.canvas.innerHTML = props.unsafeHTML;
    const basedOn =
      props.basedOn ||
      (/^[\x00-\x7F]+$/.test(props.unsafeHTML) ? "words" : "letters");
    hookNode(this.canvas, basedOn);
    const clamped = this.putEllipsis(this.calcIndexes());
    const newState = {
      clamped,
      html: this.canvas.innerHTML,
    };
    this.setState(newState, props.onReflow.bind(this, newState));
  }

  calcIndexes() {
    const indexes = [0];
    const nlUnits = (this.nlUnits = Array.from(
      this.canvas.querySelectorAll(".LinesEllipsis-unit")
    ));
    const len = nlUnits.length;
    if (nlUnits.length === 0) return indexes;

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

  putEllipsis(indexes: number[]) {
    if (indexes.length <= this.maxLine) return false;
    this.nlUnits = this.nlUnits.slice(0, indexes[this.maxLine]);
    let ndPrevUnit = this.nlUnits.pop();
    const ndEllipsis = this.makeEllipsisSpan();

    do {
      removeFollowingElementLeaves(ndPrevUnit, this.canvas);
      findBlockAncestor(ndPrevUnit).appendChild(ndEllipsis);
      ndPrevUnit = this.nlUnits.pop();
    } while (
      ndPrevUnit &&
      (!affectLayout(ndPrevUnit) ||
        ndEllipsis.offsetHeight > ndPrevUnit.offsetHeight ||
        ndEllipsis.offsetTop > ndPrevUnit.offsetTop)
    );

    if (ndPrevUnit) {
      unwrapTextNode(ndPrevUnit);
    }
    this.nlUnits.forEach(unwrapTextNode);

    return true;
  }

  makeEllipsisSpan() {
    const { ellipsisHTML, ellipsis } = this.props;
    const frag = document.createElement("span");
    frag.appendChild(document.createElement("wbr"));
    const ndEllipsis = document.createElement("span");
    ndEllipsis.className = "LinesEllipsis-ellipsis";
    if (ellipsisHTML) {
      ndEllipsis.innerHTML = ellipsisHTML;
    } else {
      ndEllipsis.textContent = ellipsis;
    }
    frag.appendChild(ndEllipsis);
    return frag;
  }

  // expose
  isClamped() {
    return this.clamped; // do not use state.clamped. #27
  }

  render() {
    const { html, clamped } = this.state;
    const { component: Component, className, unsafeHTML, ...rest } = this.props;
    return (
      <Component
        className={`LinesEllipsis ${
          clamped ? "LinesEllipsis--clamped" : ""
        } ${className}`}
        ref={(node: HTMLElement) => (this.target = node)}
        {...(omit(rest, usedProps) as any)}
      >
        <div
          dangerouslySetInnerHTML={{ __html: clamped ? html : unsafeHTML }}
        />
      </Component>
    );
  }
}

export default HTMLEllipsis;
