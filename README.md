[![npm version](https://badge.fury.io/js/react-lines-ellipsis.svg)](https://www.npmjs.com/package/react-lines-ellipsis)
[![dependencies Status](https://david-dm.org/xiaody/react-lines-ellipsis/status.svg)](https://david-dm.org/xiaody/react-lines-ellipsis)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

# react-lines-ellipsis

Poor man's multiline ellipsis component for React.JS https://xiaody.github.io/react-lines-ellipsis/

## Installation

To install the stable version:

```
npm install --save react-lines-ellipsis
```

## Usage

```jsx
import LinesEllipsis from 'react-lines-ellipsis'

<LinesEllipsis
  text='long long text'
  maxLine='3'
  ellipsis='...'
  trimRight
  basedOn='letters'
/>
```

## Options

### props.text {String}

The text you want to clamp.

### props.maxLine {Number|String}

Max count of lines allowed. Default `1`.

### props.ellipsis {String}

Text content of the ellipsis. Default `…`.

### props.trimRight {Boolean}

Trim right the clamped text to avoid putting the ellipsis on an empty line. Default `true`.

### props.basedOn {String}

Split by `letters` or `words`. By default it uses a guess based on your text.

## Limitations

- only accept plain text by default. Use `lib/html.js` for experimental rich html support
- can be fooled by some special styles: `::first-letter`, ligatures, etc.
- require modern browsers env

## Experimental html truncation

```jsx
import HTMLEllipsis from 'react-lines-ellipsis/lib/html'

<HTMLEllipsis
  unsafeHTML="simple html content"
  maxLine="5"
  ellipsis="..."
  basedOn="letters"
/>
```

## Responsive to window resize and orientation change
```js
import LinesEllipsis from 'react-lines-ellipsis'
import responsiveHOC from 'react-lines-ellipsis/lib/responsiveHOC'

const ResponsiveEllipsis = responsiveHOC()(LinesEllipsis)
// then just use ResponsiveEllipsis
```

## Dev TODOs

- [x] demo page
- [ ] test cases
- [ ] improve performance
