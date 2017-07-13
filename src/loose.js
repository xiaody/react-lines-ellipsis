const React = require('react')

function LinesEllipsisLoose (props) {
  const {component: Component = 'div', text, lineHeight} = props
  const lineHeightNumber = parseInt(lineHeight, 10)
  const unit = typeof lineHeight === 'string' && lineHeight.trim().endsWith('em')
    ? 'em'
    : 'px'
  const maxLine = +props.maxLine || 1
  return (
    <Component
      style={{
        lineHeight: `${lineHeightNumber}${unit}`,
        maxHeight: `${maxLine * lineHeightNumber}${unit}`,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: maxLine
      }}
    >
      {text}
    </Component>
  )
}

module.exports = LinesEllipsisLoose
