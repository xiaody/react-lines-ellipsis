const React = require('react')
const {canvasStyle, mirrorProps} = require('./common')

function dummySpan (text) {
  const span = document.createElement('span')
  span.className = 'LinesEllipsis-char'
  span.textContent = text
  return span
}

function hookNode (node) {
  /* eslint-env browser */
  if (node.nodeType === Node.TEXT_NODE) {
    const frag = document.createDocumentFragment()
    Array.from(node.textContent).forEach((cha) => {
      frag.appendChild(dummySpan(cha))
    })
    node.parentNode.replaceChild(frag, node)
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const nodes = [].slice.call(node.childNodes)
    const len = nodes.length
    for (let i = 0; i < len; i++) {
      hookNode(nodes[i])
    }
  }
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

function affectLayout (ndChar) {
  return !!(ndChar.offsetHeight && (ndChar.offsetWidth || /\S/.test(ndChar.textContent)))
}

/**
 * props.unsafeHTML {String} the rich content you want to clamp
 * props.maxLine {Number|String} max lines allowed
 * props.ellipsis {String} the ellipsis indicator
 * props.className {String}
 */
class HTMLEllipsis extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      html: props.unsafeHTML,
      clamped: false
    }
    this.canvas = null
    this.maxLine = 0
    this.nlChars = []
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
    this.maxLine = +props.maxLine || 1
    this.canvas.innerHTML = props.unsafeHTML
    hookNode(this.canvas)
    const clamped = this.putEllipsis(this.calcIndexes())
    this.setState({clamped})
    if (clamped) {
      this.setState({html: this.canvas.innerHTML})
    }
  }

  calcIndexes () {
    const indexes = [0]
    const nlChars = this.nlChars = Array.from(this.canvas.querySelectorAll('.LinesEllipsis-char'))
    const len = nlChars.length
    if (!nlChars.length) return indexes

    let line = 1
    let offsetTop = nlChars[0].offsetTop
    for (let i = 1; i < len; i++) {
      if (affectLayout(nlChars[i]) && nlChars[i].offsetTop - offsetTop > 1) {
        line++
        indexes.push(i)
        offsetTop = nlChars[i].offsetTop
        if (line > this.maxLine) {
          break
        }
      }
    }
    return indexes
  }

  putEllipsis (indexes) {
    if (indexes.length <= this.maxLine) return false
    this.nlChars = this.nlChars.slice(0, indexes[this.maxLine])
    let ndPrevChar = this.nlChars.pop()
    removeFollowingElementLeaves(ndPrevChar, this.canvas)
    const ndEllipsis = this.makeEllipsisSpan()
    findBlockAncestor(ndPrevChar).appendChild(ndEllipsis)

    while (ndPrevChar && (
      !affectLayout(ndPrevChar) ||
      ndEllipsis.offsetHeight > ndPrevChar.offsetHeight ||
      ndEllipsis.offsetTop > ndPrevChar.offsetTop)
    ) {
      ndPrevChar = this.nlChars.pop()
      removeFollowingElementLeaves(ndPrevChar, this.canvas)
      findBlockAncestor(ndPrevChar).appendChild(ndEllipsis)
    }
    unwrapTextNode(ndPrevChar)
    this.nlChars.forEach(unwrapTextNode)

    return true
  }

  makeEllipsisSpan () {
    const frag = document.createElement('span')
    frag.appendChild(document.createElement('wbr'))
    const ndEllipsis = document.createElement('span')
    ndEllipsis.className = 'LinesEllipsis-ellipsis'
    ndEllipsis.textContent = this.props.ellipsis
    frag.appendChild(ndEllipsis)
    return frag
  }

  render () {
    const {html, clamped} = this.state
    const {className, unsafeHTML} = this.props
    return (
      <div
        className={`LinesEllipsis ${clamped ? 'LinesEllipsis--clamped' : ''} ${className}`}
        ref={node => (this.target = node)}
      >
        <div dangerouslySetInnerHTML={{__html: clamped ? html : unsafeHTML}} />
      </div>
    )
  }
}

HTMLEllipsis.defaultProps = {
  html: '',
  maxLine: 1,
  ellipsis: '…', // &hellip;
  className: ''
}

module.exports = HTMLEllipsis
