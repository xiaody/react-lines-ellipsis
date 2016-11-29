const React = require('react')
const {canvasStyle, mirrorProps} = require('./common')

function prevSibling (node, count) {
  while (node && count--) {
    node = node.previousElementSibling
  }
  return node
}

/**
 * props.text {String} the text you want to clamp
 * props.maxLine {Number|String} max lines allowed
 * props.ellipsis {String} the ellipsis indicator
 * props.trimRight {Boolean} should we trimRight the clamped text?
 * props.className {String}
 */
class LinesEllipsis extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      text: props.text,
      clamped: false
    }
    this.chars = []
    this.maxLine = 0
    this.canvas = null
  }

  componentDidMount () {
    this.initCanvas()
    this.reflow(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this.reflow(nextProps)
  }

  componentWillUnmount () {
    this.canvas.parentNode.removeChild(this.canvas)
  }

  initCanvas () {
    if (this.canvas) return
    const canvas = this.canvas = document.createElement('div')
    canvas.className = `LinesEllipsis-canvas ${this.props.className}`
    const targetStyle = window.getComputedStyle(this.target)
    mirrorProps.forEach((key) => {
      canvas.style[key] = targetStyle[key]
    })
    Object.keys(canvasStyle).forEach((key) => {
      canvas.style[key] = canvasStyle[key]
    })
    document.body.appendChild(canvas)
  }

  reflow (props) {
    this.chars = Array.from(props.text)
    this.maxLine = +props.maxLine || 1
    this.canvas.innerHTML = this.chars.map((c) => {
      return `<span class='LinesEllipsis-char'>${c}</span>`
    }).join('')
    const ellipsisIndex = this.putEllipsis(this.calcIndexes())
    const clamped = ellipsisIndex > -1
    this.setState({
      clamped,
      text: clamped ? this.chars.slice(0, ellipsisIndex).join('') : props.text
    })
  }

  calcIndexes () {
    const indexes = [0]
    let elt = this.canvas.firstElementChild
    if (!elt) return indexes

    let index = 0
    let line = 1
    let offsetTop = elt.offsetTop
    while ((elt = elt.nextElementSibling)) {
      if (elt.offsetTop > offsetTop) {
        line++
        indexes.push(index)
        offsetTop = elt.offsetTop
      }
      index++
      if (line > this.maxLine) {
        break
      }
    }
    return indexes
  }

  putEllipsis (indexes) {
    if (indexes.length <= this.maxLine) return -1
    const chars = this.chars.slice(0, indexes[this.maxLine])
    this.canvas.innerHTML = chars.map((c, i) => {
      return `<span class='LinesEllipsis-char'>${c}</span>`
    }).join('') + `<wbr><span class='LinesEllipsis-ellipsis'>${this.props.ellipsis}</span>`

    const ndEllipsis = this.canvas.lastElementChild
    let ndPrevChar = prevSibling(ndEllipsis, 2)
    while (ndPrevChar && (ndEllipsis.offsetHeight > ndPrevChar.offsetHeight ||
      ndEllipsis.offsetTop > ndPrevChar.offsetTop)) {
      this.canvas.removeChild(ndPrevChar)
      ndPrevChar = prevSibling(ndEllipsis, 2)
      chars.pop()
    }
    return chars.length
  }

  render () {
    const {text, clamped} = this.state
    const {ellipsis, trimRight, className} = this.props
    return (
      <div
        className={`LinesEllipsis ${clamped ? 'LinesEllipsis--clamped' : ''} ${className}`}
        ref={node => (this.target = node)}
      >
        {clamped && trimRight
          ? text.replace(/[\s\uFEFF\xA0]+$/, '')
          : text
        }
        <wbr />
        {clamped &&
          <span className='LinesEllipsis-ellipsis'>{ellipsis}</span>
        }
      </div>
    )
  }
}

LinesEllipsis.defaultProps = {
  text: '',
  maxLine: 1,
  ellipsis: '…', // &hellip;
  trimRight: true,
  className: ''
}

module.exports = LinesEllipsis
