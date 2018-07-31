/* eslint-env jest */
import React from 'react'
import { mount } from 'enzyme'
import responsiveHOC from '../../src/responsiveHOC'
import LinesEllipsis from '../../src'

// debounce seems to cause the test to fail, so mock it
jest.mock('lodash/debounce', () => jest.fn(fn => fn))

describe('responsiveHOC', () => {
  const ResponsiveEllipsis = responsiveHOC()(LinesEllipsis)
  let props
  let responsiveEllipsis

  beforeEach(() => {
    props = {
      text: 'One Two Three Four Five Six Seven Eight',
      ellipsis: 'dotdotdot'
    }
    responsiveEllipsis = mount(
      <ResponsiveEllipsis {...props} />
    )
  })

  it('mounted', () => {
    const comp = responsiveEllipsis.find('div')
    expect(comp.length).toBeGreaterThan(0)
    expect(comp.html()).toContain('One Two Three')
  })

  it('fires `onResize` on resize', () => {
    window.innerWidth = 1234
    window.dispatchEvent(new Event('resize')) // eslint-disable-line no-undef
    expect(responsiveEllipsis.state('winWidth')).toBe(1234)
  })
})
