"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var React = require('react');

var debounce = require('lodash/debounce');

var isBrowser = typeof window !== 'undefined';

function responsiveHOC() {
  var wait = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 150;
  var debounceOptions = arguments.length > 1 ? arguments[1] : undefined;
  return function (Component) {
    var Responsive =
    /*#__PURE__*/
    function (_React$Component) {
      _inherits(Responsive, _React$Component);

      function Responsive(props) {
        var _this;

        _classCallCheck(this, Responsive);

        _this = _possibleConstructorReturn(this, _getPrototypeOf(Responsive).call(this, props));
        _this.state = {
          winWidth: isBrowser ? window.innerWidth : 0
        };
        _this.onResize = debounce(_this.onResize.bind(_assertThisInitialized(_this)), wait, debounceOptions);
        return _this;
      }

      _createClass(Responsive, [{
        key: "componentDidMount",
        value: function componentDidMount() {
          window.addEventListener('resize', this.onResize);
        }
      }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
          window.removeEventListener('resize', this.onResize);
          this.onResize.cancel();
        }
      }, {
        key: "onResize",
        value: function onResize() {
          this.setState({
            winWidth: window.innerWidth
          });
        }
      }, {
        key: "render",
        value: function render() {
          var _this$props = this.props,
              innerRef = _this$props.innerRef,
              rest = _objectWithoutProperties(_this$props, ["innerRef"]);

          return React.createElement(Component, _extends({
            ref: innerRef
          }, rest, this.state));
        }
      }]);

      return Responsive;
    }(React.Component);

    Responsive.displayName = "Responsive(".concat(Component.displayName || Component.name, ")");
    Responsive.defaultProps = {
      innerRef: function innerRef() {}
    };
    return Responsive;
  };
}

module.exports = responsiveHOC;

