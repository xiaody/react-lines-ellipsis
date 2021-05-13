const React = require('react')
const debounce = require('lodash/debounce')

function responsiveHOC (wait = 150, debounceOptions) {
  return Component => {
    class Responsive extends React.Component {
      constructor (props) {
        super(props)
        const {innerRef} = props
        this.state = {
          winWidth: window.innerWidth
        }
        this.innerRef = innerRef || React.createRef()
        this.forceUpdate = this.forceUpdate.bind(this)
        this.onResize = debounce(this.forceUpdate, wait, debounceOptions)
        this.resizeObserver = null
      }

      componentDidMount () {
        const { current } = this.innerRef
        const { fonts } = document
        if (fonts) {
          fonts.ready.then(this.forceUpdate)
        } else {
          setTimeout(this.forceUpdate)
        }
        if (window.ResizeObserver && current) {
          this.resizeObserver = new ResizeObserver(this.forceUpdate)
          if (this.resizeObserver) {
            this.resizeObserver.observe(current, { box: 'border-box' })
          }
        } else {
          window.addEventListener('resize', this.onResize)
        }
      }

      componentWillUnmount () {
        if (window.ResizeObserver) {
          if (this.resizeObserver) {
            this.resizeObserver.disconnect()
          }
        } else {
          window.removeEventListener('resize', this.onResize)
          this.onResize.cancel()
        }
      }

      forceUpdate () {
        this.setState({
          winWidth: window.innerWidth + Math.random() / 1000
        })
      }

      render () {
        const {innerRef, ...rest} = this.props
        return <Component innerRef={this.innerRef} {...rest} {...this.state} />
      }
    }

    Responsive.displayName = `Responsive(${Component.displayName || Component.name})`
    Responsive.defaultProps = {
      innerRef () {}
    }

    return React.forwardRef((props, ref) => (
      <Responsive innerRef={ref} {...props} />
    ))
  }
}

module.exports = responsiveHOC
