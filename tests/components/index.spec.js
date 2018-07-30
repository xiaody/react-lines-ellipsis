/* eslint-disable no-undef */
import React from 'react'
import { shallow } from 'enzyme'

import LinesEllipsis from '../../src/index'

describe('Test main functions of index.js', () => {
  let component
  let instance
  beforeEach(() => {
    jest
      .spyOn(window, 'getComputedStyle')
      .mockImplementation(() => ({display: 'block', 'padding-right': '10px'}))
    component = shallow(<LinesEllipsis />)
    instance = component.instance()
    instance.reflow({
      text: 'this is a test hello this is a test test test test',
      basedOn: 'words',
      maxLine: 1,
      onReflow: instance.reflow })
  })

  it('should set styles from target element to canvas', () => {
    instance.copyStyleToCanvas()
    expect(instance.canvas.style['padding-right']).toBe('10px')
  })

  it('make sure the text is split into spans given basedOn is words', () => {
    instance.reflow({ text: 'this is a test', basedOn: 'words', maxLine: 1, onReflow: instance.reflow })
    expect(instance.units).toEqual(['this', ' ', 'is', ' ', 'a', ' ', 'test'])
    expect(instance.canvas.innerHTML).toEqual('<span class="LinesEllipsis-unit">this</span><span class="LinesEllipsis' +
      '-unit"> </span><span class="LinesEllipsis-unit">is</span><span class="LinesEllipsis-unit"> </span><span class="' +
      'LinesEllipsis-unit">a</span><span class="LinesEllipsis-unit"> </span>' +
      '<span class="LinesEllipsis-unit">test</span>')
  })

  it('Confirm the text is cut correctly given a max-line and indexes ', () => {
    instance.putEllipsis([0, 2, 4])
    expect(instance.canvas.innerHTML).toEqual('<span class="LinesEllipsis-unit">this</span><span ' +
      'class="LinesEllipsis-unit"> </span><wbr><span class="LinesEllipsis-ellipsis">…</span>')
  })

  it('Confirm proper functions called on component mount ', () => {
    const inits = jest
      .spyOn(instance, 'initCanvas')
    const reflow = jest
      .spyOn(instance, 'reflow')
    instance.componentDidMount()
    expect(reflow).toHaveBeenCalled()
    expect(inits).toHaveBeenCalled()
  })
})
