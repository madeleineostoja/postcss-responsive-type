/*eslint no-unused-expressions: 0, block-scoped-var: 0, no-undef: 0*/
'use strict';

var postcss = require('postcss'),
    expect = require('chai').expect,
    fs = require('fs'),
    path = require('path'),
    plugin = require('../');

function compareWarnings(warnings, expected) {
  warnings.forEach(function (warning, i) {
    expect(warning).to.contain(expected[i]);
  });
}

function test(fixture, opts, warnings, done) {
  var input = fixture + '.css',
      expected = fixture + '.expected.css';

  input = fs.readFileSync(path.join(__dirname, 'fixtures', input), 'utf8');
  expected = fs.readFileSync(path.join(__dirname, 'fixtures', expected), 'utf8');

  postcss([ plugin(opts) ])
    .process(input)
    .then(function (result) {
      expect(result.css).to.eql(expected);

      if (warnings.length > 0) {
        compareWarnings(result.warnings(), warnings);
      } else {
        expect(result.warnings()).to.be.empty;
      }

      done();
    }).catch(function (error) {
      done(error);
    });

}

describe('postcss-responsive-type', function() {

  it('builds responsive type with defaults', function(done) {
   test('default', {}, [], done);
  });

  it('applies custom parameters', function(done) {
   test('custom', {}, [], done);
  });

  it('works with shorthand properties', function(done) {
   test('shorthand', {}, [], done);
  });

  it('handles mixed units', function(done) {
    test('mixed', {}, [{
      type: 'warning',
      text: 'this combination of units is not supported',
      line: 11,
      column: 1
    }], done);
  });

  it('handles em units', function(done) {
    test('em', {}, [], done);
  });

  it('properly calculates rem from root font size', function(done) {
    test('root', {}, [], done);
  });

  it('doesn\'t kill fallbacks/duplicate properties', function(done) {
   test('fallback', {}, [], done);
  });

  it('sanitizes inputs', function(done) {
   test('formatting', {}, [], done);
  });

  it('sets responsive line-height', function(done) {
   test('lineheight', {}, [], done);
  });

  it('warns about responsive unitless line-height', function(done) {
    test('unitless_lineheight', {}, [], function (error) {
      expect(error).to.contain({
          name: 'CssSyntaxError',
          reason: 'sizes with unitless values are not supported',
          plugin: 'postcss-responsive-type',
          source: '.foo {\n  line-height: responsive 1.5 2;\n}\n',
          line: 1,
          column: 1
        });

      done();
    });
  });

  it('sets responsive letterspacing', function(done) {
   test('letterspacing', {}, [], done);
  });

});
