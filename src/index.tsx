import * as React from "react";
import { canvasStyle, mirrorProps } from "./common";
import { omit } from "./helpers";

function prevSibling(node: Element, count: number): Element {
  while (node && count--) {
    node = node.previousElementSibling;
  }
  return node;
}

const defaultProps = {
  basedOn: undefined,
  className: "",
  component: "div",
  ellipsis: "…", // &hellip;
  maxLine: 1,
  onReflow() {},
  text: "",
  trimRight: true,
  winWidth: undefined, // for the HOC
};
const usedProps = Object.keys(defaultProps);

interface LinesEllipsisProps {
  basedOn?: "letters" | "words";
  className?: string;
  component?: string;
  ellipsis?: string;
  maxLine?: number;
  onReflow?: (state: LinesEllipsisState) => void;
  text: string;
  trimRight?: boolean;
  winWidth?: number; // for the HOC
}

interface LinesEllipsisState {
  text: string;
  clamped: boolean;
}
/**
 * props.text {String} the text you want to clamp
 * props.maxLine {Number|String} max lines allowed
 * props.ellipsis {String} the ellipsis indicator
 * props.trimRight {Boolean} should we trimRight the clamped text?
 * props.basedOn {String} letters|words
 * props.className {String}
 */
class LinesEllipsis extends React.Component<
  LinesEllipsisProps,
  LinesEllipsisState
> {
  static defaultProps = defaultProps;

  private units = [];
  private maxLine = 0;
  private canvas = null;
  private clamped = false;
  private target: HTMLElement;

  constructor(props: LinesEllipsisProps) {
    super(props);
    this.state = {
      text: props.text,
      clamped: false,
    };
  }

  componentDidMount() {
    this.initCanvas();
    this.reflow(this.props);
  }

  componentDidUpdate(prevProps: LinesEllipsisProps) {
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

  setState(state: LinesEllipsisState, callback: () => void) {
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

  reflow(props: LinesEllipsisProps) {
    /* eslint-disable no-control-regex */
    const basedOn =
      props.basedOn ||
      (/^[\x00-\x7F]+$/.test(props.text) ? "words" : "letters");
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
    this.canvas.innerHTML = this.units
      .map((c) => {
        return `<span class='LinesEllipsis-unit'>${c}</span>`;
      })
      .join("");
    const ellipsisIndex = this.putEllipsis(this.calcIndexes());
    const clamped = ellipsisIndex > -1;
    const newState = {
      clamped,
      text: clamped ? this.units.slice(0, ellipsisIndex).join("") : props.text,
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
    while ((elt = elt.nextElementSibling)) {
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

  putEllipsis(indexes: number[]) {
    if (indexes.length <= this.maxLine) return -1;
    const lastIndex = indexes[this.maxLine];
    const units = this.units.slice(0, lastIndex);
    const maxOffsetTop = this.canvas.children[lastIndex].offsetTop;
    this.canvas.innerHTML =
      units
        .map((c) => {
          return `<span class='LinesEllipsis-unit'>${c}</span>`;
        })
        .join("") +
      `<wbr><span class='LinesEllipsis-ellipsis'>${this.props.ellipsis}</span>`;
    const ndEllipsis = this.canvas.lastElementChild;
    let ndPrevUnit = prevSibling(ndEllipsis, 2) as HTMLElement;
    while (
      ndPrevUnit &&
      (ndEllipsis.offsetTop > maxOffsetTop || // IE & Edge: doesn't support <wbr>
        ndEllipsis.offsetHeight > ndPrevUnit.offsetHeight ||
        ndEllipsis.offsetTop > ndPrevUnit.offsetTop)
    ) {
      this.canvas.removeChild(ndPrevUnit);
      ndPrevUnit = prevSibling(ndEllipsis, 2) as HTMLElement;
      units.pop();
    }
    return units.length;
  }

  // expose
  public isClamped() {
    return this.clamped; // do not use state.clamped. #27
  }

  render() {
    const { text, clamped } = this.state;
    const {
      component: Component,
      ellipsis,
      trimRight,
      className,
      ...rest
    } = this.props;
    return (
      <Component
        className={`LinesEllipsis ${
          clamped ? "LinesEllipsis--clamped" : ""
        } ${className}`}
        ref={(node: HTMLElement) => (this.target = node)}
        {...(omit(rest, usedProps) as any)}
      >
        {clamped && trimRight ? text.replace(/[\s\uFEFF\xA0]+$/, "") : text}
        <wbr />
        {clamped && <span className="LinesEllipsis-ellipsis">{ellipsis}</span>}
      </Component>
    );
  }
}

export default LinesEllipsis;
