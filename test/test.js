/*eslint no-unused-expressions: 0, block-scoped-var: 0, no-undef: 0*/
'use strict';

var postcss = require('postcss'),
    expect = require('chai').expect,
    fs = require('fs'),
    path = require('path'),
    plugin = require('../');

var test = function (fixture, opts, done) {
  var input = fixture + '.css',
      expected = fixture + '.expected.css';

  input = fs.readFileSync(path.join(__dirname, 'fixtures', input), 'utf8');
  expected = fs.readFileSync(path.join(__dirname, 'fixtures', expected), 'utf8');

  postcss([ plugin(opts) ])
    .process(input)
    .then(function (result) {
      expect(result.css).to.eql(expected);
      expect(result.warnings()).to.be.empty;
    done();
  }).catch(function (error) {
    done(error);
  });

};

describe('postcss-responsive-type', function() {

  it('builds responsive type with defaults', function(done) {
   test('default', {}, done);
  });

  it('applies custom parameters', function(done) {
   test('custom', {}, done);
  });

  it('works with shorthand properties', function(done) {
   test('shorthand', {}, done);
  });

  it('handles mixed units', function(done) {
    test('mixed', {}, done);
  });

  it('properly calculates rem from root font size', function(done) {
    test('root', {}, done);
  });

  it('doesn\'t kill fallbacks/duplicate properties', function(done) {
   test('fallback', {}, done);
  });

  it('sanitizes inputs', function(done) {
   test('formatting', {}, done);
  });

});
