'use strict';

var postcss = require('postcss');

module.exports = postcss.plugin('postcss-responsive-type', function () {

  // Default parameters
  var params = {
    minSize: '12px',
    maxSize: '21px',
    minWidth: '420px',
    maxWidth: '1280px',
    rootSize: '16px'
  };

  // Map expanded declarations to params
  var paramDecls = {
    minSize: 'min-font-size',
    maxSize: 'max-font-size',
    minWidth: 'lower-font-range',
    maxWidth: 'upper-font-range'
  };

  /**
   * Fetch plugin parameters from css rules
   * @param  {object} rule CSS rule to parse
   */
  var fetchParams = function(rule){

    // Fetch params from shorthand font-size
    rule.eachDecl('font-size', function(decl){

      if (decl.value.indexOf('responsive') > -1) {
        var vals = decl.value.match(/([0-9]+\w*)/g);

        if (vals){
          params.minSize = vals[0];
          params.maxSize = vals[1];
        }
      }

    });

    // Fetch params from shorthand font-range
    rule.eachDecl('font-range', function(decl){
      var vals = decl.value.split(/\s+/);
      params.minWidth = vals[0];
      params.maxWidth = vals[1];
      decl.removeSelf();
    });

    // Fetch parameters from expanded properties
    Object.keys(paramDecls).forEach(function(param){
      rule.eachDecl(paramDecls[param], function(decl){
        params[param] = decl.value;
        decl.removeSelf();
      });
    });

    // Check root font-size (for rem units)
    if (rule.selector === 'html'){
      rule.eachDecl('font-size', function(decl){
        params.rootSize = decl.value;
      });
    }

  };

  /**
   * Build new responsive type rules
   * @param  {object} rule     old CSS rule
   * @param  {object} newRules object to store new CSS rules
   * @return {object}          object of new CSS rules
   */
  var buildRules = function(rule, newRules) {

    // Build the responsive decleration
    var sizeDiff = parseFloat(params.maxSize) - parseFloat(params.minSize),
        widthDiff = parseFloat(params.maxWidth) - parseFloat(params.minWidth);

    newRules.responsive = 'calc(' + params.minSize + ' + ' + sizeDiff.toString() + ' * ((100vw - ' + params.minWidth + ') / ' + widthDiff.toString() + '))';

    // Build the media queries
    newRules.minMedia = postcss.atRule({
      name: 'media',
      params: 'screen and (max-width: ' + params.minWidth + ')',
      before: '\n'
    });

    newRules.maxMedia = postcss.atRule({
      name: 'media',
      params: 'screen and (min-width: ' + params.maxWidth + ')',
      before: '\n'
    });

    // Add the required content to new media queries
    newRules.minMedia.append({
        selector: rule.selector
    }).eachRule(function(selector){
      selector.append({
        prop: 'font-size',
        value: params.minSize
      });
    });

    newRules.maxMedia.append({
      selector: rule.selector
    }).eachRule(function(selector){
      selector.append({
        prop: 'font-size',
        value: params.maxSize
      });
    });

    return newRules;
  };

  // Do it!
  return function (css) {
    css.eachRule(function(rule){

      var thisRule,
          newRules = {};

      rule.eachDecl('font-size', function(decl){

        // If rule doesn't contain responsve keyword, exit
        if (!decl.value.indexOf('responsive') > -1) {
          return;
        }

        // Otherwise store the rul in a var
        thisRule = decl.parent;

      });

      fetchParams(rule);

      buildRules(rule, newRules);

      // Insert the base responsive decleration
      rule.eachDecl('font-size', function(decl){
        if (decl.value.indexOf('responsive') > -1) {
          decl.replaceWith({prop: decl.prop, value: newRules.responsive });
        }
      });

      // Insert the media queries
      rule.parent.insertAfter(thisRule, newRules.minMedia);
      rule.parent.insertAfter(newRules.minMedia, newRules.maxMedia);

    });
  };

});
