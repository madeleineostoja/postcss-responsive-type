# PostCSS Responsive Type
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

[PostCSS][PostCSS] plugin for automagical responsive typography. Adds a `responsive` property to `font-size` that generates complex `calc` and `vw` based font sizes.

Inspired by [Typographic][typographic].

Part of [Rucksack - CSS Superpowers](http://simplaio.github.io/rucksack).

![Responsive Type Demo][demo]

###### Quick start:
```css
html {
  font-size: responsive;
}
```

###### Specify parameters:
Units can be in px, rem, or em.
```css
html {
  font-size: responsive 12px 21px; /* min-size, max-size */
  font-range: 420px 1280px; /* viewport widths between which font-size is fluid */
}
```

###### Expanded syntax:
```css
html {
  font-size: responsive;
  min-font-size: 12px;
  max-font-size: 21px;
  lower-font-range: 420px;
  upper-font-range: 1280px;
}
```

###### What it outputs:
```css
html {
  font-size: calc(12px + 9 * ( (100vw - 420px) / 860));
}

@media screen and (max-width: 420px) {
  html {
    font-size: 12px;
  }
}

@media screen and (min-width: 1280px) {
  html {
    font-size: 21px;
  }
}
```
That `calc` expression is equivalent to

```
min-size + (min-size - max-size) * ( (100vw - min-width) / ( max-width - min-width) )
```

--

### Defaults
To get started you only need to specify `font-size: responsive;`, all other properties have sane defaults.

`min-font-size`: 14px

`max-font-size`: 21px

`lower-font-range`: 420px

`upper-font-range`: 1280px

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
postcss([ require('postcss-responsive-type') ])
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
[calc-polyfill]: https://github.com/closingtag/calc-polyfill
[respond]: https://github.com/scottjehl/Respond
[vminpoly]: https://github.com/saabi/vminpoly
[poststylus]: https://github.com/seaneking/poststylus
