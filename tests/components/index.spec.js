/* eslint-env jest */
import React from 'react'
import { shallow } from 'enzyme'

import LinesEllipsis from '../../src/'

describe('Test internal functions of index.js', () => {
  let component
  let instance
  beforeEach(() => {
    jest
      .spyOn(window, 'getComputedStyle')
      .mockImplementation(() => ({ display: 'block', 'padding-right': '10px' }))
    component = shallow(<LinesEllipsis onReflow={() => {}} />)
    instance = component.instance()
    instance.reflow({
      text: 'this is a test hello this is a test test test test',
      basedOn: 'words',
      maxLine: 1,
      onReflow: () => {}
    })
  })

  it('should set styles from target element to canvas', () => {
    instance.copyStyleToCanvas()
    expect(instance.canvas.style['padding-right']).toBe('10px')
  })

  it('make sure the text is split into spans given basedOn is words', () => {
    instance.reflow({ text: 'this is a test', basedOn: 'words', maxLine: 1, onReflow: () => {} })
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
describe('component functionality tests', () => {
  let props
  let component
  beforeEach(() => {
    props = {
      ellipsis: 'dotdotdot',
      trimRight: true,
      maxLine: 1,
      onReflow: () => {},
      text: 'Whitespace ' // trailing tab
    }
    component = shallow(<LinesEllipsis {...props} />)
  })

  it('trims trailing whitespace', () => {
    component.instance().componentDidMount()
    const comp = component.find('.LinesEllipsis')
    expect(comp.text).not.toContain(' ') // trailing tab
  })

  it('removes canvas div on unmount', () => {
    const unmountSpy = jest.spyOn(component.instance(), 'componentWillUnmount')
    component.unmount()
    expect(unmountSpy).toHaveBeenCalledTimes(1)
  })
})
