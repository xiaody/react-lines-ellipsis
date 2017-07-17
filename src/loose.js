const React = require('react')

function LinesEllipsisLoose (props) {
  const {component: Component, text, lineHeight, maxLine, style, ...rest} = props
  const lineHeightNumber = parseFloat(lineHeight)
  const unit = typeof lineHeight === 'string' && lineHeight.trim().endsWith('em')
    ? 'em'
    : 'px'
  const maxLineNumber = +maxLine || 1
  return (
    <Component
      {...rest}
      style={{
        ...style,
        lineHeight: `${lineHeightNumber}${unit}`,
        maxHeight: `${maxLineNumber * lineHeightNumber}${unit}`,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: maxLineNumber
      }}
    >
      {text}
    </Component>
  )
}

LinesEllipsisLoose.defaultProps = {
  component: 'div',
  maxLine: 1,
  style: {}
}

module.exports = LinesEllipsisLoose
