(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod);
    global.common = mod.exports;
  }
})(this, function (module) {
  'use strict';

  module.exports = {
    canvasStyle: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      height: 0,
      overflow: 'hidden',
      'padding-top': 0,
      'padding-bottom': 0,
      border: 'none'
    },
    mirrorProps: ['box-sizing', 'width', 'font-size', 'font-weight', 'font-family', 'font-style', 'letter-spacing', 'text-indent', 'white-space', 'word-break', 'padding-left', 'padding-right']
  };
});

