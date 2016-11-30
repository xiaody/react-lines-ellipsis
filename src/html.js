const React = require('react')
const {canvasStyle, mirrorProps} = require('./common')

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
        units = node.textContent.split(/\b|(?=\W)/)
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
    this.state = {
      html: props.unsafeHTML,
      clamped: false
    }
    this.canvas = null
    this.maxLine = 0
    this.nlUnits = []
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
    /* eslint-disable no-control-regex */
    this.maxLine = +props.maxLine || 1
    this.canvas.innerHTML = props.unsafeHTML
    const basedOn = props.basedOn || /^[\x00-\x7F]+$/.test(props.unsafeHTML) ? 'words' : 'letters'
    hookNode(this.canvas, basedOn)
    const clamped = this.putEllipsis(this.calcIndexes())
    this.setState({clamped})
    if (clamped) {
      this.setState({html: this.canvas.innerHTML})
    }
  }

  calcIndexes () {
    const indexes = [0]
    const nlUnits = this.nlUnits = Array.from(this.canvas.querySelectorAll('.LinesEllipsis-unit'))
    const len = nlUnits.length
    if (!nlUnits.length) return indexes

    let line = 1
    let offsetTop = nlUnits[0].offsetTop
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
    removeFollowingElementLeaves(ndPrevUnit, this.canvas)
    const ndEllipsis = this.makeEllipsisSpan()
    findBlockAncestor(ndPrevUnit).appendChild(ndEllipsis)

    while (ndPrevUnit && (
      !affectLayout(ndPrevUnit) ||
      ndEllipsis.offsetHeight > ndPrevUnit.offsetHeight ||
      ndEllipsis.offsetTop > ndPrevUnit.offsetTop)
    ) {
      ndPrevUnit = this.nlUnits.pop()
      removeFollowingElementLeaves(ndPrevUnit, this.canvas)
      findBlockAncestor(ndPrevUnit).appendChild(ndEllipsis)
    }
    unwrapTextNode(ndPrevUnit)
    this.nlUnits.forEach(unwrapTextNode)

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
