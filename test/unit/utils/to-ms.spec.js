'use strict'

const toMs = require('../../../src/utils/to-ms')

const chai = require('chai')
chai.should()

describe('to-ms 测试', function () {
  ;[
    [123, 123],
    [-1, -1],
    [0, 0],
    ['-1', -1],
    ['123', 123],
    ['123m', 7380000],
    ['1d', 86400000],
    ['asdf', 0],
    [true, 0],
    [false, 0],
    [null, 0],
    [undefined, 0],
    [NaN, 0],
    [{}, 0],
    [() => {}, 0]
  ].map(value => {
    it(`批量测试 input: ${JSON.stringify(value[0])}, output: ${value[1]}`, function () {
      return toMs(value[0]).should.be.equal(value[1])
    })
  })
})
