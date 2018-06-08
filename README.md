# PostCSS Responsive Type
[![NPM version][npm-badge]][npm-url] [![NPM downloads][downloads-badge]][npm-url] [![Build Status][travis-badge]][travis-url]

Generate automagical fluid typography, with new `responsive` properties for `font-size`, `line-height`, and `letter-spacing`. Built on [PostCSS][postcss].

![Responsive Type Demo][demo]

Inspired by [this post][post].

_Part of [Rucksack - CSS Superpowers](http://simplaio.github.io/rucksack)_

### Contents

- [Usage](#usage)
  - [Quick start](#quick-start)
  - [Specify parameters](#specify-parameters)
  - [Expanded syntax](#expanded-syntax)
  - [Responsive `line-height` and `letter-spacing`](#responsive-line-height-and-letter-spacing)
- [Defaults](#defaults)
- [Browser Support](#browser-support)

## Usage

#### Quick start

```css
html {
  font-size: responsive;
}
```

> **Pro tip:** set a reaponsive font-size on `html` and use `rem` units throughout your project to make your whole UI fluid

#### Specify parameters

Units can be in px, rem, or em. When using em units, be sure that the `font-range` is specified in em as well.

```css
html {
  font-size: responsive 12px 21px; /* min-size, max-size */
  font-range: 420px 1280px; /* viewport widths between which font-size is fluid */
}
```

#### Expanded syntax

```css
html {
  font-size: responsive;
  min-font-size: 12px;
  max-font-size: 21px;
  lower-font-range: 420px;
  upper-font-range: 1280px;
}
```

#### Responsive `line-height` and `letter-spacing`

PostCSS Responsive Type also allows you to set fluid sizes for the `line-height` and `letter-spacing` properties. They have the same syntax and work the same way as responsive font sizes.

```css
html {
  line-height: responsive 1.2em 1.8em;
  line-height-range: 420px 1280px;

  /* or extended syntax: */
  line-height: responsive;
  min-line-height: 1.2em;
  max-line-height: 1.8em;
  lower-line-height-range: 420px;
  upper-line-height-range: 1280px;
}
```

```css
html {
  letter-spacing: responsive 0px 4px;
  letter-spacing-range: 420px 1280px;

  /* or extended syntax: */
  letter-spacing: responsive;
  min-letter-spacing: 0px;
  max-letter-spacing: 4px;
  lower-letter-spacing-range: 420px;
  upper-letter-spacing-range: 1280px;
}
```

> **Note:** Unitless line heights are not supported.

## Defaults
To get started you only need to specify the `responsive` property, all other values have sane defaults.

##### `font-size`

- `min-font-size`: 14px

- `max-font-size`: 21px

- `lower-font-range`: 420px

- `upper-font-range`: 1280px


##### `line-height`

- `min-line-height`: 1.2em

- `max-line-height`: 1.8em

- `lower-line-height-range`: 420px

- `upper-line-height-range`: 1280px


##### `letter-spacing`

- `min-letter-spacing`: 0px

- `max-letter-spacing`: 4px

- `lower-letter-spacing-range`: 420px

- `upper-letter-spacing-range`: 1280px


## Browser Support

`postcss-responsive-type` just uses calc, vw units, and media queries behind the scenes, so it works on all modern browsers (IE9+). Although Opera Mini is not supported.

Legacy browsers will ignore the output `responsive` font-size. You can easily provide a simple static fallback:

```css
.foo {
  font-size: 16px;
  font-size: responsive;
}
```

***

MIT © [Sean King](https://twitter.com/seaneking)

[npm-badge]: https://img.shields.io/npm/v/postcss-responsive-type.svg
[npm-url]: https://npmjs.org/package/postcss-responsive-type
[downloads-badge]: https://img.shields.io/npm/dm/postcss-responsive-type.svg
[travis-badge]: https://travis-ci.org/seaneking/postcss-responsive-type.svg?branch=master
[travis-url]: https://travis-ci.org/seaneking/postcss-responsive-type
[PostCSS]: https://github.com/postcss/postcss
[demo]: /demo.gif?raw=true
[post]: http://madebymike.com.au/writing/precise-control-responsive-typography/
[poststylus]: https://github.com/seaneking/poststylus
