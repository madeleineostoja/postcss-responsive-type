'use strict';

var postcss = require('postcss');

module.exports = postcss.plugin('postcss-responsive-type', function () {

  // Default parameters
  var params = {
    'font-size': {
      minSize: '12px',
      maxSize: '21px',
      minWidth: '420px',
      maxWidth: '1280px'
    },
    'lineheight': {
      minSize: '1rem',
      maxSize: '2rem',
      minWidth: '420px',
      maxWidth: '1280px'
    }
  };

  // Map supported params to their range declarations
  var paramRangeDecl = {
    'font-size': 'font-range',
    'lineheight': 'lineheight-range'
  };

  // Map expanded declarations to params
  var paramDecls = {
    'font-size': {
      minSize: 'min-font-size',
      maxSize: 'max-font-size',
      minWidth: 'lower-font-range',
      maxWidth: 'upper-font-range'
    },
    'lineheight': {
      minSize: 'min-lineheight',
      maxSize: 'max-lineheight',
      minWidth: 'lower-lineheight-range',
      maxWidth: 'upper-lineheight-range'
    }
  };

  var rootSize = '16px';

  var fetchResponsiveSizes = function(rule, declName, cb){
    rule.walkDecls(declName, function(decl){

      if (decl.value.indexOf('responsive') > -1) {
        var vals = decl.value.match(/\d*\.?\d+\w+/g);
        if (vals) {
          cb(vals[0], vals[1]);
        }
      }

    });
  };

  var fetchRangeSizes = function(rule, declName, cb){
    rule.walkDecls(declName, function(decl){
      var vals = decl.value.split(/\s+/);
      cb(vals[0], vals[1]);
      decl.remove();
    });
  };

  /**
   * Fetch plugin parameters from css rules
   * @param  {object} rule CSS rule to parse
   */
  var fetchParams = function(rule, declName){

    // Fetch params from shorthand declName, i.e., font-size or lineheight, etc
    fetchResponsiveSizes(rule, declName, function(minSize, maxSize) {
      params[declName].minSize = minSize;
      params[declName].maxSize = maxSize;
    });

    // Fetch params from shorthand font-range or lineheight-range
    fetchRangeSizes(rule, paramRangeDecl[declName], function(minSize, maxSize){
      params[declName].minWidth = minSize;
      params[declName].maxWidth = maxSize;
    });

    // Fetch parameters from expanded properties
    Object.keys(paramDecls[declName]).forEach(function(param){
      rule.walkDecls(paramDecls[declName][param], function(decl){
        params[declName][param] = decl.value.trim();
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
    var match = value.match(/px|rem|em/);

    if (match) {
      return match.toString();
    }
    return null; // unitless value
  };

  /**
   * Build new responsive type rules
   * @param  {object} rule     old CSS rule
   * @return {object}          object of new CSS rules
   */
  var buildRules = function(rule, declName, result) {
    var rules = {},
        minSize,
        maxSize,
        minWidth,
        maxWidth;

    var currParams = params[declName]; // font-size or lineheight params

    minSize = currParams.minSize;
    maxSize = currParams.maxSize;

    var sizeUnit = getUnit(currParams.minSize),
        maxSizeUnit = getUnit(currParams.maxSize),
        widthUnit = getUnit(currParams.minWidth),
        maxWidthUnit = getUnit(currParams.maxWidth);

    if (declName === 'font-size' && sizeUnit === null) {
      rule.warn(result, 'font-size cannot have unitless values');
    }

    if (sizeUnit !== maxSizeUnit && widthUnit !== maxWidthUnit) {
      rule.warn(result, 'min/max unit types must match');
    }

    if (sizeUnit === 'rem' && widthUnit === 'px') {

      minWidth = pxToRem(currParams.minWidth);
      maxWidth = pxToRem(currParams.maxWidth);

    } else if (sizeUnit === widthUnit || sizeUnit === 'rem' && widthUnit === 'em') {

      minWidth = currParams.minWidth;
      maxWidth = currParams.maxWidth;

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
      params: 'screen and (max-width: ' + currParams.minWidth + ')'
    });

    rules.maxMedia = postcss.atRule({
      name: 'media',
      params: 'screen and (min-width: ' + currParams.maxWidth + ')'
    });

    // Add the required content to new media queries
    rules.minMedia.append({
        selector: rule.selector
    }).walkRules(function(selector){
      selector.append({
        prop: declName,
        value: currParams.minSize
      });
    });

    rules.maxMedia.append({
      selector: rule.selector
    }).walkRules(function(selector){
      selector.append({
        prop: declName,
        value: currParams.maxSize
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

      rule.walkDecls(/^(font-size|lineheight)$/, function(decl){

        // If decl doesn't contain responsve keyword, exit
        if (decl.value.indexOf('responsive') === -1) {
          return;
        }

        thisRule = decl.parent;

        fetchParams(thisRule, decl.prop);

        newRules = buildRules(thisRule, decl.prop, result);

        // Insert the base responsive decleration
        if (decl.value.indexOf('responsive') > -1) {
          decl.replaceWith({ prop: decl.prop, value: newRules.responsive });
        }

        // Insert the media queries
        thisRule.parent.insertAfter(thisRule, newRules.minMedia);
        thisRule.parent.insertAfter(thisRule, newRules.maxMedia);

      });
    });
  };

});
