# PostCSS Responsive Type
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

[PostCSS][PostCSS] plugin for automagical responsive typography. Adds a `responsive` property to `font-size`, `line-height` and `letter-spacing` that generates complex `calc` and `vw` based font sizes.

Inspired by [this post][post] from [@MikeRiethmuller][mike], and [Typographic][typographic].

Part of [Rucksack - CSS Superpowers](http://simplaio.github.io/rucksack).

![Responsive Type Demo][demo]

##### Quick start:

```css
html {
  font-size: responsive;
}
```

##### Specify parameters:

Units can be in px, rem, or em. When using em units, be sure that the `font-range` is specified in em as well.

```css
html {
  font-size: responsive 12px 21px; /* min-size, max-size */
  font-range: 420px 1280px; /* viewport widths between which font-size is fluid */
}
```

##### Expanded syntax:

```css
html {
  font-size: responsive;
  min-font-size: 12px;
  max-font-size: 21px;
  lower-font-range: 420px;
  upper-font-range: 1280px;
}
```

##### Responsive `line-height` and `letter-spacing`:

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

**Note:** Unitless line heights are not supported.

--

### Defaults
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

--

### Browser Support

`postcss-responsive-type` just uses calc, vw units, and media queries behind the scenes, so it works on all modern browsers (IE9+). Although Opera Mini is not supported.

Legacy browsers will ignore the output `responsive` font-size. You can easily provide a simple static fallback:

```css
.foo {
  font-size: 16px;
  font-size: responsive;
}
```

Alternatively, if you feel the need to fully support legacy browsers or Opera Mini, there are polyfills that can help!

- [respond][respond] for media query support.

- [calc-polyfill][calc-polyfill] for `calc` support.

- [vminpoly][vminpoly] for `vw` unit support.

--

### Usage

```js
postcss([ require('postcss-responsive-type')() ])
```

See [PostCSS][PostCSS] docs for examples for your environment.

You can use `postcss-responsive-type` with Stylus through [PostStylus][poststylus].

--

### License

MIT © [Sean King](https://twitter.com/seaneking)

[npm-image]: https://badge.fury.io/js/postcss-responsive-type.svg
[npm-url]: https://npmjs.org/package/postcss-responsive-type
[travis-image]: https://travis-ci.org/seaneking/postcss-responsive-type.svg?branch=master
[travis-url]: https://travis-ci.org/seaneking/postcss-responsive-type
[daviddm-image]: https://david-dm.org/seaneking/postcss-responsive-type.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/seaneking/postcss-responsive-type
[PostCSS]: https://github.com/postcss/postcss
[demo]: /demo.gif?raw=true
[typographic]: https://github.com/corysimmons/typographic
[post]: http://madebymike.com.au/writing/precise-control-responsive-typography/
[mike]: https://twitter.com/MikeRiethmuller
[calc-polyfill]: https://github.com/closingtag/calc-polyfill
[respond]: https://github.com/scottjehl/Respond
[vminpoly]: https://github.com/saabi/vminpoly
[poststylus]: https://github.com/seaneking/poststylus
