'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');
var debounce = require('lodash/debounce');
var isBrowser = typeof window !== 'undefined';

function responsiveHOC() {
  var wait = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 150;
  var debounceOptions = arguments[1];

  return function (Component) {
    var Responsive = function (_React$Component) {
      _inherits(Responsive, _React$Component);

      function Responsive(props) {
        _classCallCheck(this, Responsive);

        var _this = _possibleConstructorReturn(this, (Responsive.__proto__ || Object.getPrototypeOf(Responsive)).call(this, props));

        _this.state = {
          winWidth: isBrowser ? window.innerWidth : 0
        };
        _this.onResize = debounce(_this.onResize.bind(_this), wait, debounceOptions);
        return _this;
      }

      _createClass(Responsive, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
          window.addEventListener('resize', this.onResize);
        }
      }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
          window.removeEventListener('resize', this.onResize);
          this.onResize.cancel();
        }
      }, {
        key: 'onResize',
        value: function onResize() {
          this.setState({
            winWidth: window.innerWidth
          });
        }
      }, {
        key: 'render',
        value: function render() {
          var _props = this.props,
              innerRef = _props.innerRef,
              rest = _objectWithoutProperties(_props, ['innerRef']);

          return React.createElement(Component, _extends({ ref: innerRef }, rest, this.state));
        }
      }]);

      return Responsive;
    }(React.Component);

    Responsive.displayName = 'Responsive(' + (Component.displayName || Component.name) + ')';
    Responsive.defaultProps = {
      innerRef: function innerRef() {}
    };
    return Responsive;
  };
}

module.exports = responsiveHOC;

