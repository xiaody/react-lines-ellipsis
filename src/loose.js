const React = require('react')

function LinesEllipsisLoose (props) {
  const {component: Component, text, lineHeight, maxLine, style, overflowFallback, ...rest} = props
  const maxLineNumber = +maxLine || 1
  let usedStyle = {
    ...style,
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: maxLineNumber
  }
  if (overflowFallback && lineHeight) {
    const lineHeightNumber = parseFloat(lineHeight)
    const unit = typeof lineHeight === 'string' && lineHeight.trim().endsWith('em')
      ? 'em'
      : 'px'
    usedStyle = {
      ...usedStyle,
      lineHeight: `${lineHeightNumber}${unit}`,
      maxHeight: `${maxLineNumber * lineHeightNumber}${unit}`,
      overflow: 'hidden'
    }
  }
  return (
    <Component {...rest} style={usedStyle}>
      {text}
    </Component>
  )
}

LinesEllipsisLoose.defaultProps = {
  component: 'div',
  maxLine: 1,
  style: {},
  overflowFallback: true
}

module.exports = LinesEllipsisLoose
