# Textcomplete

Inline textarea completion. Basically autocomplete for your #hashtags and @mentions.

![](http://i.minus.com/ibhb0XhyJ0KlwF.gif)

## Demo

```bash
make
open test/index.html
```

## API

```jade
.container
  .Textcomplete-menu(.Textcomplete-hidden)
    .Textcomplete-option(.Textcomplete-highlighted)
    .Textcomplete-option(.Textcomplete-highlighted)
    .Textcomplete-option(.Textcomplete-highlighted)
  textarea
```

Note that `.Textcomplete-menu` has `position: absolute;` by default, so you should have a non-statically positioned parent somewhere.

### var search = textcomplete(element, [menu])

`element` is the `<textarea>` element to enhance. `menu` is an optional menu element to use - by default it creates its own and appends it before the input.

### search.re =

Set the regular expression for a match. For example, for a Twitter handle, you would use `/@(\w{1,15})$/`. Note that the string is matched up to the textarea caret.

### search.format=

Customize the formatting of every option. By default, it is:

```js
search.format = function (option) {
  return '<div>' + (option.name || option.title) + '</div>'
}
```

You may return either an HTML string or a DOM element.

### search.formatSelection =

You must set your own format selection. The signature is:

```js
search.formatSelection = function (option) {
  return ''
}
```

For example, returning `option.title` would replace the matched string with `option.title`.

### search.query =

You need to set your own query function. Your query function should look something like this:

```js
search.query = function (text) {
  // remove all the options
  search.clear()

  ajax(function (err, options) {
    // do your own error handling
    if (err) return console.error(err.stack);

    // if there are no options, just hide the menu
    if (!options.length) return search.hide()

    // show the menu
    search.show()

    // push all the options to the menu
    search.push(options)

    // highlight the first option
    search.highlight(0)

    // set the position of the menu
    search.position(100, 100)
  })
}
```

Each `option` should be an `{}` with an `.id` as well as either a `.title` or a `.name`. Each `option` could also be a string, which will automatically be converted to an object.

### search.position(top, left)

Set the `top` and `left` pixel values of the menu. This requires a little magic because it depends on how your textarea is positioned to the first non-statically positioned ancestor, its border, etc.

You may use [textarea-caret-position](https://github.com/component/textarea-caret-position) to base the logic off of the current location of the caret.

### search.push(options...)

Push options to the menu.

### search.clear()

Remove all the options from the menu.

### search.hide()

Hide the menu.

### Event: hide

When the menu is hidden

### search.show()

Show the menu.

### Event: show

When the menu is shown

### Event: highlight

When an option is highlighted

## Browser Compatibility

IE9+ - PRs for IE8 welcomed.

## License

The MIT License (MIT)

Copyright (c) 2014 Jonathan Ong me@jongleberry.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.