const preact = require('preact')
const debounce = require('lodash/debounce')
const LinesEllipsis = require('../src/index')
const HTMLEllipsis = require('../src/html')
const lorem = require('./lorem')

const {h, render, Component} = preact
const lang = window.location.search.slice(1)
const defaultText = lorem[lang] || lorem.en
const unsafe = lang === 'html'

if (unsafe) {
  document.querySelector('.unsafe-warning').removeAttribute('hidden')
}

let winWidth = window.innerWidth

/** @jsx h */
class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      text: defaultText,
      maxLine: 5,
      useEllipsis: true,
      renderId: 1
    }
    this.onTextClick = this.onTextClick.bind(this)
    this.onTextKey = this.onTextKey.bind(this)
    this.onTextEdit = debounce(this.onTextEdit.bind(this), 100)
    this.onChangeLines = debounce(this.onChangeLines.bind(this))
    this.onResize = debounce(this.onResize.bind(this), 150)
  }

  componentDidMount () {
    window.addEventListener('resize', this.onResize)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.onResize)
  }

  onTextClick (e) {
    e.preventDefault()
    this.setState({useEllipsis: false})
  }

  onTextKey (e) {
    if (e.keyCode === 13) {
      this.onTextClick()
    }
  }

  onTextEdit (e) {
    this.setState({
      text: e.target.value,
      useEllipsis: true
    })
  }

  onChangeLines (e) {
    this.setState({
      maxLine: e.target.value,
      useEllipsis: true
    })
  }

  onResize () {
    // optimize for iOS Safari
    if (window.innerWidth === winWidth) return
    winWidth = window.innerWidth
    this.setState({
      renderId: this.state.renderId + 1
    })
  }

  renderUnsafe () {
    const {text, maxLine, useEllipsis, renderId} = this.state
    return (
      <div>
        <label className='lines-controller hide-sm'>
          Show {maxLine} lines:
          <input type='range' value={maxLine} min='1' max='10' onInput={this.onChangeLines} />
        </label>
        {useEllipsis
          ? (
            <div onClick={this.onTextClick} onKeyDown={this.onTextKey} tabIndex='0'>
              <HTMLEllipsis
                className='ellipsis-html'
                unsafeHTML={text}
                maxLine={maxLine}
                ellipsis='... read more'
                key={renderId}
              />
            </div>
          )
          : <div className='ellipsis-html' dangerouslySetInnerHTML={{__html: text}} />
        }
        <textarea
          className='text-editor'
          value={text}
          onInput={this.onTextEdit}
          placeHolder='Enter any HTML'
          spellCheck='false'
        />
      </div>
    )
  }

  renderSafe () {
    const {text, maxLine, useEllipsis, renderId} = this.state
    return (
      <div>
        <label className='lines-controller hide-sm'>
          Show {maxLine} lines:
          <input type='range' value={maxLine} min='1' max='10' onInput={this.onChangeLines} />
        </label>
        {useEllipsis
          ? (
            <div onClick={this.onTextClick} onKeyDown={this.onTextKey} tabIndex='0'>
              <LinesEllipsis
                className='ellipsis-text'
                text={text}
                maxLine={maxLine}
                ellipsis='... read more'
                key={renderId}
              />
            </div>
          )
          : <div className='ellipsis-text'>{text}</div>
        }
        <textarea
          className='text-editor'
          value={text}
          onInput={this.onTextEdit}
          placeHolder='Enter any text'
          spellCheck='false'
        />
      </div>
    )
  }

  render () {
    return unsafe ? this.renderUnsafe() : this.renderSafe()
  }
}

window.requestAnimationFrame(function bootstrap () {
  render(<App />, document.getElementById('react-root'))
})
