const React = require('react')
const {canvasStyle, mirrorProps} = require('./common')
const {omit} = require('./helpers')

function hookNode (node, basedOn) {
  /* eslint-env browser */
  if (basedOn !== 'letters' && basedOn !== 'words') {
    throw new Error(`Unsupported options basedOn: ${basedOn}`)
  }
  if (node.nodeType === Node.TEXT_NODE) {
    const frag = document.createDocumentFragment()
    let units
    switch (basedOn) {
      case 'words':
        units = node.textContent.match(/[^\s]+|\s/g) || []
        break
      case 'letters':
        units = Array.from(node.textContent)
        break
    }
    units.forEach((unit) => {
      frag.appendChild(dummySpan(unit))
    })
    node.parentNode.replaceChild(frag, node)
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const nodes = [].slice.call(node.childNodes)
    const len = nodes.length
    for (let i = 0; i < len; i++) {
      hookNode(nodes[i], basedOn)
    }
  }
}

function dummySpan (text) {
  const span = document.createElement('span')
  span.className = 'LinesEllipsis-unit'
  span.textContent = text
  return span
}

function unwrapTextNode (node) {
  node.parentNode.replaceChild(
    document.createTextNode(node.textContent),
    node
  )
}

function removeFollowingElementLeaves (node, root) {
  if (!root.contains(node) || node === root) return
  while (node.nextElementSibling) {
    node.parentNode.removeChild(node.nextElementSibling)
  }
  removeFollowingElementLeaves(node.parentNode, root)
}

function findBlockAncestor (node) {
  let ndAncestor = node
  while ((ndAncestor = ndAncestor.parentNode)) {
    if (/p|div|main|section|h\d|ul|ol|li/.test(ndAncestor.tagName.toLowerCase())) {
      return ndAncestor
    }
  }
}

function affectLayout (ndUnit) {
  return !!(ndUnit.offsetHeight && (ndUnit.offsetWidth || /\S/.test(ndUnit.textContent)))
}

const defaultProps = {
  component: 'div',
  unsafeHTML: '',
  maxLine: 1,
  ellipsis: '…', // &hellip;
  ellipsisHTML: undefined,
  className: '',
  basedOn: undefined,
  onReflow () {},
  innerRef: undefined,
  winWidth: undefined // for the HOC
}
const usedProps = Object.keys(defaultProps)

/**
 * props.unsafeHTML {String} the rich content you want to clamp
 * props.maxLine {Number|String} max lines allowed
 * props.ellipsis {String} the ellipsis indicator
 * props.basedOn {String} letters|words
 * props.className {String}
 */
class HTMLEllipsis extends React.Component {
  constructor (props) {
    super(props)
    const {innerRef} = props
    this.state = {
      html: props.unsafeHTML,
      clamped: false
    }
    this.canvas = null
    this.maxLine = 0
    this.nlUnits = []
    this.innerRef = innerRef || React.createRef()
  }

  componentDidMount () {
    this.initCanvas()
    this.reflow(this.props)
  }

  componentDidUpdate (prevProps) {
    if (prevProps.winWidth !== this.props.winWidth) {
      this.copyStyleToCanvas()
    }
    if (this.props !== prevProps) {
      this.reflow(this.props)
    }
  }

  componentWillUnmount () {
    this.canvas.parentNode.removeChild(this.canvas)
  }

  setState (state, callback) {
    if (typeof state.clamped !== 'undefined') {
      this.clamped = state.clamped
    }
    return super.setState(state, callback)
  }

  initCanvas () {
    if (this.canvas) return
    const canvas = this.canvas = document.createElement('div')
    canvas.className = `LinesEllipsis-canvas ${this.props.className}`
    canvas.setAttribute('aria-hidden', 'true')
    this.copyStyleToCanvas()
    Object.keys(canvasStyle).forEach((key) => {
      canvas.style[key] = canvasStyle[key]
    })
    document.body.appendChild(canvas)
  }

  copyStyleToCanvas () {
    const targetStyle = window.getComputedStyle(this.innerRef.current)
    mirrorProps.forEach((key) => {
      this.canvas.style[key] = targetStyle[key]
    })
  }

  reflow (props) {
    /* eslint-disable no-control-regex */
    this.maxLine = +props.maxLine || 1
    this.canvas.innerHTML = props.unsafeHTML
    const basedOn = props.basedOn || (/^[\x00-\x7F]+$/.test(props.unsafeHTML) ? 'words' : 'letters')
    hookNode(this.canvas, basedOn)
    const clamped = this.putEllipsis(this.calcIndexes())
    const newState = {
      clamped,
      html: this.canvas.innerHTML
    }
    this.setState(newState, props.onReflow.bind(this, newState))
  }

  calcIndexes () {
    const indexes = [0]
    const nlUnits = this.nlUnits = Array.from(this.canvas.querySelectorAll('.LinesEllipsis-unit'))
    const len = nlUnits.length
    if (!nlUnits.length) return indexes

    const nd1stLayoutUnit = nlUnits.find(affectLayout)
    if (!nd1stLayoutUnit) return indexes

    let line = 1
    let offsetTop = nd1stLayoutUnit.offsetTop
    for (let i = 1; i < len; i++) {
      if (affectLayout(nlUnits[i]) && nlUnits[i].offsetTop - offsetTop > 1) {
        line++
        indexes.push(i)
        offsetTop = nlUnits[i].offsetTop
        if (line > this.maxLine) {
          break
        }
      }
    }
    return indexes
  }

  putEllipsis (indexes) {
    if (indexes.length <= this.maxLine) return false
    this.nlUnits = this.nlUnits.slice(0, indexes[this.maxLine])
    let ndPrevUnit = this.nlUnits.pop()
    const ndEllipsis = this.makeEllipsisSpan()

    do {
      removeFollowingElementLeaves(ndPrevUnit, this.canvas)
      findBlockAncestor(ndPrevUnit).appendChild(ndEllipsis)
      ndPrevUnit = this.nlUnits.pop()
    } while (ndPrevUnit && (
      !affectLayout(ndPrevUnit) ||
      ndEllipsis.offsetHeight > ndPrevUnit.offsetHeight ||
      ndEllipsis.offsetTop > ndPrevUnit.offsetTop)
    )

    if (ndPrevUnit) {
      unwrapTextNode(ndPrevUnit)
    }
    this.nlUnits.forEach(unwrapTextNode)

    return true
  }

  makeEllipsisSpan () {
    const {ellipsisHTML, ellipsis} = this.props
    const frag = document.createElement('span')
    frag.appendChild(document.createElement('wbr'))
    const ndEllipsis = document.createElement('span')
    ndEllipsis.className = 'LinesEllipsis-ellipsis'
    if (ellipsisHTML) {
      ndEllipsis.innerHTML = ellipsisHTML
    } else {
      ndEllipsis.textContent = ellipsis
    }
    frag.appendChild(ndEllipsis)
    return frag
  }

  // expose
  isClamped () {
    return this.clamped // do not use state.clamped. #27
  }

  render () {
    const {html, clamped} = this.state
    const {component: Component, className, unsafeHTML, ...rest} = this.props
    return (
      <Component
        className={`LinesEllipsis ${clamped ? 'LinesEllipsis--clamped' : ''} ${className}`}
        ref={this.innerRef}
        {...omit(rest, usedProps)}
      >
        <div dangerouslySetInnerHTML={{__html: clamped ? html : unsafeHTML}} />
      </Component>
    )
  }
}

HTMLEllipsis.defaultProps = defaultProps

module.exports = HTMLEllipsis
