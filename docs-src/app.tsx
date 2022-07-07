import React from "react";
import { createRoot } from "react-dom/client";
import _LinesEllipsis from "../src/index";
import _HTMLEllipsis from "../src/html";
import responsiveHOC from "../src/responsiveHOC";
import lorem from "./lorem";
const LinesEllipsis = responsiveHOC()(_LinesEllipsis);
const HTMLEllipsis = responsiveHOC()(_HTMLEllipsis);
const log = console.log.bind(console);

const lang = window.location.search.slice(1);
const defaultText = (lorem as Record<string, string>)[lang] || lorem.en;
const defaultMaxLine = 3;
const unsafe = lang === "html";

if (unsafe) {
  document.querySelector(".unsafe-warning")!.removeAttribute("hidden");
}

class App extends React.Component<
  {},
  {
    text: string;
    maxLine: number;
    useEllipsis: boolean;
  }
> {
  private linesEllipsis: _LinesEllipsis | _HTMLEllipsis | undefined;

  constructor(props: {}) {
    super(props);
    this.state = {
      text: defaultText,
      maxLine: defaultMaxLine,
      useEllipsis: true,
    };
    this.handleTextClick = this.handleTextClick.bind(this);
    this.handleTextKey = this.handleTextKey.bind(this);
    this.handleTextEdit = this.handleTextEdit.bind(this);
    this.handleChangeLines = this.handleChangeLines.bind(this);
  }

  componentDidMount(): void {
    log(`isClamped: ${this.linesEllipsis!.isClamped()} when page didMount`);
  }

  handleTextClick(e: React.MouseEvent): void {
    e.preventDefault();
    this.setState({ useEllipsis: false });
  }

  handleTextKey(e: React.KeyboardEvent): void {
    if (e.key === "Enter") {
      e.preventDefault();
      this.setState({ useEllipsis: false });
    }
  }

  handleTextEdit(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    this.setState({
      text: e.target.value,
      useEllipsis: true,
    });
  }

  handleChangeLines(e: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({
      maxLine: Number(e.target.value),
      useEllipsis: true,
    });
  }

  renderUnsafe() {
    const { text, maxLine, useEllipsis } = this.state;
    return (
      <div>
        <label className="lines-controller hide-sm">
          Show {maxLine} lines:
          <input
            type="range"
            defaultValue={defaultMaxLine}
            min="1"
            max="10"
            onChange={this.handleChangeLines}
          />
        </label>
        {useEllipsis ? (
          <div
            onClick={this.handleTextClick}
            onKeyDown={this.handleTextKey}
            tabIndex={0}
          >
            <HTMLEllipsis
              innerRef={(node) => {
                this.linesEllipsis = node;
              }}
              component="article"
              className="ellipsis-html"
              unsafeHTML={text}
              maxLine={maxLine}
              ellipsisHTML="<i>... read more</i>"
              onReflow={log}
            />
          </div>
        ) : (
          <article
            className="ellipsis-html"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        )}
        <textarea
          className="text-editor"
          defaultValue={defaultText}
          onChange={this.handleTextEdit}
          placeholder="Enter any HTML"
          spellCheck="false"
        />
      </div>
    );
  }

  renderSafe() {
    const { text, maxLine, useEllipsis } = this.state;
    return (
      <div>
        <label className="lines-controller hide-sm">
          Show {maxLine} lines:
          <input
            type="range"
            defaultValue={defaultMaxLine}
            min="1"
            max="10"
            onChange={this.handleChangeLines}
          />
        </label>
        {useEllipsis ? (
          <div
            onClick={this.handleTextClick}
            onKeyDown={this.handleTextKey}
            tabIndex={0}
          >
            <LinesEllipsis
              innerRef={(node) => {
                this.linesEllipsis = node;
              }}
              component="article"
              className="ellipsis-text"
              text={text}
              maxLine={maxLine}
              ellipsis="... read more"
              onReflow={log}
            />
          </div>
        ) : (
          <article className="ellipsis-text">{text}</article>
        )}
        <textarea
          className="text-editor"
          defaultValue={defaultText}
          onChange={this.handleTextEdit}
          placeholder="Enter any text"
          spellCheck="false"
        />
      </div>
    );
  }

  render() {
    return unsafe ? this.renderUnsafe() : this.renderSafe();
  }
}

window.requestAnimationFrame(function bootstrap() {
  createRoot(document.getElementById("react-root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
