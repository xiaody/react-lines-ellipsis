const React = require('react')
const ReactDOM = require('react-dom')
const LinesEllipsis = require('../index')
const lorem = require('./lorem')

const lang = location.search.slice(1)
const defaultText = lorem[lang] || lorem.en

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      text: defaultText,
      maxLine: 5,
      useEllipsis: true,
      renderId: 1
    }
    this.onTextClick = this.onTextClick.bind(this)
    this.onTextEdit = this.onTextEdit.bind(this)
  }

  componentDidMount() {
    window.addEventListener('resize', () => {
      this.setState({
        renderId: this.state.renderId + 1
      })
    })
  }

  onTextClick (e) {
    this.setState({useEllipsis: false})
  }

  onTextEdit (e) {
    this.setState({
      text: e.target.value,
      useEllipsis: true
    })
  }

  render () {
    const {text, maxLine, useEllipsis, renderId} = this.state
    return (
      <div>
        {useEllipsis
          ? (
            <div onClick={this.onTextClick}>
              <LinesEllipsis
                className="ellipsis-text"
                text={text}
                maxLine={maxLine}
                ellipsis="... read more"
                key={renderId}
              />
            </div>
          )
          : <div className="ellipsis-text">{text}</div>
        }
        <textarea
          className="text-editor"
          defaultValue={defaultText}
          onChange={this.onTextEdit}
          placeholder="Enter any text"
          spellCheck="false"
        />
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('react-root'))
