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
 * props.basedOn {String} letters|words
 * props.className {String}
 */
class LinesEllipsis extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      text: props.text,
      clamped: false
    }
    this.units = []
    this.maxLine = 0
    this.canvas = null
  }

  componentDidMount () {
    this.initCanvas()
    this.reflow(this.props)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.winWidth !== this.props.winWidth) {
      this.copyStyleToCanvas()
    }
    this.reflow(nextProps)
  }

  componentWillUnmount () {
    this.canvas.parentNode.removeChild(this.canvas)
  }

  initCanvas () {
    if (this.canvas) return
    const canvas = this.canvas = document.createElement('div')
    canvas.className = `LinesEllipsis-canvas ${this.props.className}`
    this.copyStyleToCanvas()
    Object.keys(canvasStyle).forEach((key) => {
      canvas.style[key] = canvasStyle[key]
    })
    document.body.appendChild(canvas)
  }

  copyStyleToCanvas () {
    const targetStyle = window.getComputedStyle(this.target)
    mirrorProps.forEach((key) => {
      this.canvas.style[key] = targetStyle[key]
    })
  }

  reflow (props) {
    /* eslint-disable no-control-regex */
    const basedOn = props.basedOn || (/^[\x00-\x7F]+$/.test(props.text) ? 'words' : 'letters')
    switch (basedOn) {
      case 'words':
        this.units = props.text.split(/\b|(?=\W)/)
        break
      case 'letters':
        this.units = Array.from(props.text)
        break
      default:
        throw new Error(`Unsupported options basedOn: ${basedOn}`)
    }
    this.maxLine = +props.maxLine || 1
    this.canvas.innerHTML = this.units.map((c) => {
      return `<span class='LinesEllipsis-unit'>${c}</span>`
    }).join('')
    const ellipsisIndex = this.putEllipsis(this.calcIndexes())
    const clamped = ellipsisIndex > -1
    this.setState({
      clamped,
      text: clamped ? this.units.slice(0, ellipsisIndex).join('') : props.text
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
    const lastIndex = indexes[this.maxLine]
    const units = this.units.slice(0, lastIndex)
    const maxOffsetTop = this.canvas.children[lastIndex].offsetTop
    this.canvas.innerHTML = units.map((c, i) => {
      return `<span class='LinesEllipsis-unit'>${c}</span>`
    }).join('') + `<wbr><span class='LinesEllipsis-ellipsis'>${this.props.ellipsis}</span>`

    const ndEllipsis = this.canvas.lastElementChild
    let ndPrevUnit = prevSibling(ndEllipsis, 2)
    while (ndPrevUnit &&
      (
        ndEllipsis.offsetTop > maxOffsetTop || // IE & Edge: doesn't support <wbr>
        ndEllipsis.offsetHeight > ndPrevUnit.offsetHeight ||
        ndEllipsis.offsetTop > ndPrevUnit.offsetTop
      )
    ) {
      this.canvas.removeChild(ndPrevUnit)
      ndPrevUnit = prevSibling(ndEllipsis, 2)
      units.pop()
    }
    return units.length
  }

  // expose
  isClamped () {
    return this.state.clamped
  }

  render () {
    const {text, clamped} = this.state
    const {component: Component, ellipsis, trimRight, className} = this.props
    return (
      <Component
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
      </Component>
    )
  }
}

LinesEllipsis.defaultProps = {
  component: 'div',
  text: '',
  maxLine: 1,
  ellipsis: '…', // &hellip;
  trimRight: true,
  className: ''
}

module.exports = LinesEllipsis
