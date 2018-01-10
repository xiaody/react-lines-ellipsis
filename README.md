[![npm version](https://badge.fury.io/js/react-lines-ellipsis.svg)](https://www.npmjs.com/package/react-lines-ellipsis)
[![dependencies Status](https://david-dm.org/xiaody/react-lines-ellipsis/status.svg)](https://david-dm.org/xiaody/react-lines-ellipsis)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://standardjs.com/)

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

### props.component {String}

The tagName of the rendered node. Default `div`.

## Limitations

- not clamps text on the server side or with JavaScript disabled
- only accepts plain text by default. Use `lib/html.js` for experimental rich html support
- can be fooled by some special styles: `::first-letter`, ligatures, etc.
- requires modern browsers env

## Experimental html truncation

```jsx
import HTMLEllipsis from 'react-lines-ellipsis/lib/html'

<HTMLEllipsis
  unsafeHTML='simple html content'
  maxLine='5'
  ellipsis='...'
  basedOn='letters'
/>
```

## Responsive to window resize and orientation change
```js
import LinesEllipsis from 'react-lines-ellipsis'
import responsiveHOC from 'react-lines-ellipsis/lib/responsiveHOC'

const ResponsiveEllipsis = responsiveHOC()(LinesEllipsis)
// then just use ResponsiveEllipsis
```

## Loose version

This is a non-standardized css-based solution for some webkit-based browsers.
It may have better render performance but also can be fragile.
Be sure to test your use case if you use it.
See https://css-tricks.com/line-clampin/#article-header-id-0 for some introduction.

```jsx
import LinesEllipsisLoose from 'react-lines-ellipsis/lib/loose'

<LinesEllipsisLoose
  text='long long text'
  maxLine='2'
  lineHeight='16'
/>
```

## Dev TODOs

- [x] demo page
- [ ] test cases
- [ ] improve performance
