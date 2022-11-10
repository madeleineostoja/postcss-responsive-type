'use strict';

const postcss = require('postcss');

const DEFAULT_PARAMS = {
  'font-size': {
    minSize: '12px',
    maxSize: '21px',
    minWidth: '420px',
    maxWidth: '1280px',
  },
  'line-height': {
    minSize: '1.2em',
    maxSize: '1.8em',
    minWidth: '420px',
    maxWidth: '1280px',
  },
  'letter-spacing': {
    minSize: '0px',
    maxSize: '4px',
    minWidth: '420px',
    maxWidth: '1280px',
  },
};

const PARAM_RANGE = {
  'font-size': 'font-range',
  'line-height': 'line-height-range',
  'letter-spacing': 'letter-spacing-range',
};

const PARAM_DECLS = {
  'font-size': {
    minSize: 'min-font-size',
    maxSize: 'max-font-size',
    minWidth: 'lower-font-range',
    maxWidth: 'upper-font-range',
  },
  'line-height': {
    minSize: 'min-line-height',
    maxSize: 'max-line-height',
    minWidth: 'lower-line-height-range',
    maxWidth: 'upper-line-height-range',
  },
  'letter-spacing': {
    minSize: 'min-letter-spacing',
    maxSize: 'max-letter-spacing',
    minWidth: 'lower-letter-spacing-range',
    maxWidth: 'upper-letter-spacing-range',
  },
};

// Assign default root size
let rootSize = '16px';

/**
 * Extract the unit from a string
 * @param  {String} value value to extract unit from
 * @return {String}       unit
 */

function getUnit(value) {
  const match = value.match(/px|rem|em/);

  if (match) {
    return match.toString();
  }
  return null;
}

/**
 * Px -> Rem converter
 * @param  {String} px pixel value
 * @return {String}    rem value
 */
function pxToRem(px) {
  return `${parseFloat(px) / parseFloat(rootSize)}rem`;
}

function fetchResponsiveSizes(rule, declName, cb) {
  rule.walkDecls(declName, (decl) => {
    if (decl.value.includes('responsive')) {
      const vals = decl.value.match(/-?\d*\.?\d+(?:\w+)?/g);

      if (vals) {
        cb(vals[0], vals[1]);
      }
    }
  });
}

function fetchRangeSizes(rule, declName, cb) {
  rule.walkDecls(declName, (decl) => {
    const vals = decl.value.split(/\s+/);
    cb(vals[0], vals[1]);
    decl.remove();
  });
}

function fetchParams(rule, declName) {
  const params = Object.assign({}, DEFAULT_PARAMS[declName]);

  // Fetch params from shorthand declName, i.e., font-size or line-height, etc
  fetchResponsiveSizes(rule, declName, (minSize, maxSize) => {
    params.minSize = minSize;
    params.maxSize = maxSize;
  });

  // Fetch params from shorthand font-range or line-height-range
  fetchRangeSizes(rule, PARAM_RANGE[declName], (minSize, maxSize) => {
    params.minWidth = minSize;
    params.maxWidth = maxSize;
  });

  // Fetch parameters from expanded properties
  const rangeDecl = PARAM_DECLS[declName];

  Object.keys(rangeDecl).forEach((param) => {
    rule.walkDecls(rangeDecl[param], (decl) => {
      params[param] = decl.value.trim();
      decl.remove();
    });
  });

  return params;
}

/**
 * Build new responsive type rules
 * @param  {object} rule     old CSS rule
 * @return {object}          object of new CSS rules
 */
function buildRules(rule, declName, params, result) {
  const rules = {};
  const minSize = params.minSize;
  const maxSize = params.maxSize;
  let minWidth = null;
  let maxWidth = null;
  const sizeUnit = getUnit(params.minSize);
  const maxSizeUnit = getUnit(params.maxSize);
  const widthUnit = getUnit(params.minWidth);
  const maxWidthUnit = getUnit(params.maxWidth);
  let sizeDiff = null;
  let rangeDiff = null;

  if (sizeUnit === null) {
    throw rule.error('sizes with unitless values are not supported');
  }

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
  sizeDiff = parseFloat(maxSize) - parseFloat(minSize);
  rangeDiff = parseFloat(maxWidth) - parseFloat(minWidth);

  rules.responsive = `calc(${minSize} + ${sizeDiff} * ((100vw - ${minWidth}) / ${rangeDiff}))`;

  // Build the media queries
  rules.minMedia = postcss.atRule({
    name: 'media',
    params: `screen and (max-width: ${params.minWidth})`,
  });

  rules.maxMedia = postcss.atRule({
    name: 'media',
    params: `screen and (min-width: ${params.maxWidth})`,
  });

  // Add the required content to new media queries
  rules.minMedia
    .append({
      selector: rule.selector,
    })
    .walkRules((selector) => {
      selector.append({
        prop: declName,
        value: params.minSize,
      });
    });

  rules.maxMedia
    .append({
      selector: rule.selector,
    })
    .walkRules((selector) => {
      selector.append({
        prop: declName,
        value: params.maxSize,
      });
    });

  return rules;
}

const plugin = () => ({
  postcssPlugin: 'postcss-responsive-type',

  // Will be called on Root node once, when all children will be processed.
  // Execute the plugin at the end, after being processed by all plugins
  // (such as mixins and variables), to get the converted declarations values.
  OnceExit(rootInstance, { result }) {
    rootInstance.walkRules((rule) => {
      rule.walkDecls(/^(font-size|line-height|letter-spacing)$/, (decl) => {
        if (rule.selector.includes('html')) {
          if (decl.prop === 'font-size' && decl.value.includes('px')) {
            rootSize = decl.value;
          }
        }

        // If decl contain "responsve" keyword
        if (decl.value.includes('responsive')) {
          const params = fetchParams(rule, decl.prop);
          const newRules = buildRules(rule, decl.prop, params, result);

          // Insert the base responsive decleration
          if (decl.value.includes('responsive')) {
            decl.replaceWith({ prop: decl.prop, value: newRules.responsive });
          }
          // Insert the media queries
          rule.parent.insertAfter(rule, newRules.minMedia);
          rule.parent.insertAfter(rule, newRules.maxMedia);
        }
      });
    });
  },
});

plugin.postcss = true;
module.exports = plugin;
