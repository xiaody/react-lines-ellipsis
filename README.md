[![npm version](https://badge.fury.io/js/react-lines-ellipsis.svg)](https://www.npmjs.com/package/react-lines-ellipsis)
[![dependencies Status](https://david-dm.org/xiaody/react-lines-ellipsis/status.svg)](https://david-dm.org/xiaody/react-lines-ellipsis)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

# react-lines-ellipsis

Poor man's multiline ellipsis component for React.JS

### Installation

To install the stable version:

```
npm install --save react-lines-ellipsis
```

## Usage

```jsx
import LinesEllipsis from 'react-lines-ellipsis'

<LinesEllipsis
  text="long long text"
  maxLine="3"
  ellipsis="..."
  trimRight
/>
```

## Limitations

- only accept plain text by default. use `lib/html.js` for experimental rich html support
- can be fooled by some styles: `::first-letter`, italic fonts, etc.
- require modern browsers env

## Experimental html truncation

```jsx
import HTMLEllipsis from 'react-lines-ellipsis/lib/html'

<HTMLEllipsis
  unsafeHTML="simple html content"
  maxLine="5"
  ellipsis="..."
/>
```

## Dev TODOs

- [x] demo page
- [ ] test cases
- [ ] improve performance
