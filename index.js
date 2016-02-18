'use strict';

var postcss = require('postcss');

module.exports = postcss.plugin('postcss-responsive-type', function () {

  // Default parameters
  var params = {
    minSize: '12px',
    maxSize: '21px',
    minWidth: '420px',
    maxWidth: '1280px'
  };

  // Map expanded declarations to params
  var paramDecls = {
    minSize: 'min-font-size',
    maxSize: 'max-font-size',
    minWidth: 'lower-font-range',
    maxWidth: 'upper-font-range'
  };

  var rootSize = '16px';

  /**
   * Fetch plugin parameters from css rules
   * @param  {object} rule CSS rule to parse
   */
  var fetchParams = function(rule){

    // Fetch params from shorthand font-size
    rule.walkDecls('font-size', function(decl){

      if (decl.value.indexOf('responsive') > -1) {
        var vals = decl.value.match(/\d*\.?\d+\w+/g);
        if (vals){
          params.minSize = vals[0];
          params.maxSize = vals[1];
        }
      }

    });

    // Fetch params from shorthand font-range
    rule.walkDecls('font-range', function(decl){
      var vals = decl.value.split(/\s+/);
      params.minWidth = vals[0];
      params.maxWidth = vals[1];
      decl.remove();
    });

    // Fetch parameters from expanded properties
    Object.keys(paramDecls).forEach(function(param){
      rule.walkDecls(paramDecls[param], function(decl){
        params[param] = decl.value.trim();
        decl.remove();
      });
    });

  };

  /**
   * Px -> Rem converter
   * @param  {String} px pixel value
   * @return {String}    rem value
   */
  var pxToRem = function(px) {
    return parseFloat(px) / parseFloat(rootSize) + 'rem';
  };

  /**
   * Extract the unit from a string
   * @param  {String} value value to extract unit from
   * @return {String}       unit
   */
  var getUnit = function(value) {
    return value.match(/px|rem|em/).toString();
  };

  /**
   * Build new responsive type rules
   * @param  {object} rule     old CSS rule
   * @return {object}          object of new CSS rules
   */
  var buildRules = function(rule, result) {
    var rules = {},
        minSize,
        maxSize,
        minWidth,
        maxWidth;

    minSize = params.minSize;
    maxSize = params.maxSize;

    var sizeUnit = getUnit(params.minSize),
        maxSizeUnit = getUnit(params.maxSize),
        widthUnit = getUnit(params.minWidth),
        maxWidthUnit = getUnit(params.maxWidth);

    if (sizeUnit !== maxSizeUnit && widthUnit !== maxWidthUnit) {
      rule.warn(result, 'min/max unit types must match');
    }

    if (sizeUnit === 'rem' && widthUnit === 'px') {

      minWidth = pxToRem(params.minWidth);
      maxWidth = pxToRem(params.maxWidth);

    } else if (sizeUnit === widthUnit || sizeUnit === 'rem' && widthUnit === 'em') {

      minWidth = params.minWidth;
      maxWidth = params.maxWidth;

    } else {

      rule.warn(result, 'this combination of units is not supported');

    }

    // Build the responsive type decleration
    var sizeDiff = parseFloat(maxSize) - parseFloat(minSize),
        rangeDiff = parseFloat(maxWidth) - parseFloat(minWidth);
    rules.responsive = 'calc(' + minSize + ' + ' + sizeDiff + ' * ((100vw - ' + minWidth + ') / ' + rangeDiff + '))';

    // Build the media queries
    rules.minMedia = postcss.atRule({
      name: 'media',
      params: 'screen and (max-width: ' + params.minWidth + ')'
    });

    rules.maxMedia = postcss.atRule({
      name: 'media',
      params: 'screen and (min-width: ' + params.maxWidth + ')'
    });

    // Add the required content to new media queries
    rules.minMedia.append({
        selector: rule.selector
    }).walkRules(function(selector){
      selector.append({
        prop: 'font-size',
        value: params.minSize
      });
    });

    rules.maxMedia.append({
      selector: rule.selector
    }).walkRules(function(selector){
      selector.append({
        prop: 'font-size',
        value: params.maxSize
      });
    });

    return rules;
  };

  // Do it!
  return function (css, result) {
    css.walkRules(function(rule){

      var thisRule,
          newRules;

      // Check root font-size (for rem units)
      if (rule.selector.indexOf('html') > -1){
        rule.walkDecls('font-size', function(decl){
          if (decl.value.indexOf('px') > -1){
            rootSize = decl.value;
          }
        });
      }

      rule.walkDecls('font-size', function(decl){

        // If decl doesn't contain responsve keyword, exit
        if (decl.value.indexOf('responsive') === -1) {
          return;
        }

        thisRule = decl.parent;

        fetchParams(thisRule);

        newRules = buildRules(thisRule, result);

        // Insert the base responsive decleration
        if (decl.value.indexOf('responsive') > -1) {
          decl.replaceWith({prop: decl.prop, value: newRules.responsive });
        }

        // Insert the media queries
        thisRule.parent.insertAfter(thisRule, newRules.minMedia);
        thisRule.parent.insertAfter(thisRule, newRules.maxMedia);

      });
    });
  };

});
