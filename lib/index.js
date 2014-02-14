/* jshint browser: true */

var query = require('query')
var keyname = require('keyname')
var closest = require('closest')
var Classes = require('classes')
var debounce = require('debounce')
var next = require('next-sibling')
var prev = require('previous-sibling')

// ignore these keys from triggering a match
var ignore = [
  'down',
  'up',
  'esc',
  'enter',
  'tab',
  'capslock',
  'meta',
  'shift',
  'ctrl',
  'alt',
  'meta',
  'pageup',
  'pagedown',
  'end',
  'home',
  'ins',
  'del',
]

module.exports = Textcomplete

Textcomplete.prototype = Object.create(require('complement'))

function Textcomplete(el, menu) {
  if (!(this instanceof Textcomplete))
    return new Textcomplete(el, menu)

  this.el = el

  // you can set your own menu element
  if (!menu) {
    menu = document.createElement('div')
    el.parentNode.insertBefore(menu, el)
  }

  // hidden on initialization
  this.classes = Classes(this.menu = menu)
    .add('Textcomplete-menu')
    .add('Textcomplete-hidden')

  // current options
  this.options = []
  // currently highlighted option
  this.highlighted = null

  // setup stuff
  var self = this

  // debounced version of query
  this._query = debounce(function (match) {
    self.query(match)
  }, 300)

  // setup complement methods
  this._onblur()
  this._setupoptions()

  // match on focus
  el.addEventListener('focus', function () {
    // the cursor is positioned on the next tick
    setTimeout(function () {
      self.match()
    }, 0)
  })

  // handle menu events when the menu is shown
  // future for performance:
  // - add and remove this listener on hide and show
  el.addEventListener('keydown', function (e) {
    if (!self.shown) return

    switch (keyname(e.which)) {
      case 'down':
        stop(e)
        self.next()
        return
      case 'up':
        stop(e)
        self.previous()
        return
      case 'esc':
        stop(e)
        self.hide()
        return
      case 'enter':
        stop(e)
        self.select(self.highlighted)
        return
    }
  })

  // textcomplete on certain key strokes
  // uses `keyup` because the value has to be registered
  // before we can do anything
  // to do: throttle `.match()` for performance
  el.addEventListener('keyup', function (e) {
    if (!~ignore.indexOf(keyname(e.which))) self.match()
  })

  // highlight the currently hovered option
  menu.addEventListener('mousemove', function (e) {
    self.highlight(self.find(e.target))
  })
}

/**
 * Checks to see if the current text matches the given regexp.
 * If it does, it calls a search.
 */

Textcomplete.prototype.match = function () {
  var el = this.el
  var text = el.value
  if (!text) return // nothing to match
  var index = el.selectionEnd // cursor index
  // if text is selected, ignore
  if (el.selectionStart !== index) return this.hide()
  var head = text.slice(0, index)
  var match = this.re.exec(head)
  // hide the menu if there's no match
  if (!match) return this.hide()
  // call a search on the current match
  this._query(match)
  return this
}

/**
 * Position the menu based on the parent.
 */

Textcomplete.prototype.position = function (top, left) {
  var style = this.menu.style
  style.top = top + 'px'
  style.left = left + 'px'
  return this
}

/**
 * Only clears `.Textcomplete-option`s.
 */

Textcomplete.prototype.clear = function () {
  this.options = []
  this.selected = this.highlighted = null
  var options = query.all('.Textcomplete-option', this.menu)
  for (var i = 0; i < options.length; i++) remove(options[i])
  return this
}

Textcomplete.prototype.show = function () {
  var classes = this.classes
  if (classes.has('Textcomplete-hidden')) {
    if (!this.selected) this.highlight(0)
    classes.remove('Textcomplete-hidden')
    this.shown = true
    this.emit('show')
  }
  return this
}

Textcomplete.prototype.hide = function () {
  if (!this.classes.has('Textcomplete-hidden')) {
    this.classes.add('Textcomplete-hidden')
    this.highlighted = null
    this.options.forEach(function (option) {
      Classes(option.el).remove('Textcomplete-highlighted')
    })
    this.clear()
    this.shown = false
    this.emit('hide')
  }
  return this
}

/**
 * Format the element of an option.
 * If you want to manipulate items yourself,
 * Use this method.
 */

Textcomplete.prototype.formatOption = function (option, el) {
  Classes(option.el = el).add('Textcomplete-option')
  el.setAttribute('data-Textcomplete-id', option.id)
  return option
}

/**
 * When an option is set, i.e. actually emit a `change` event.
 */

Textcomplete.prototype.select = function (option) {
  if (!(option = this.highlight(option))) return
  var el = this.el
  this.selected = option
  var index = el.selectionEnd
  var text = el.value
  var start = text.slice(0, index)
    .replace(this.re, this.formatSelection(option))
    + ' ' // add a trailing space
  el.value = start + text.slice(index)
  el.setSelectionRange(start.length, start.length)
  this.emit('change', option)
  this.hide()
  return option
}

/**
 * Highlight an option
 */

Textcomplete.prototype.highlight = function (option) {
  if (!(option = this.get(option))) return
  this.emit('highlight', this.highlighted = option)
  var options = this.options
  var o
  var el = option.el
  for (var i = 0; i < options.length; i++)
    Classes(o = options[i].el)
      .toggle('Textcomplete-highlighted', o === el)
  return option
}

// highlight the next element
Textcomplete.prototype.next = function () {
  var highlighted = this.highlighted
  if (!highlighted) return
  return this.highlight(next(highlighted.el, '.Textcomplete-option'))
}

// highlight the previous element
Textcomplete.prototype.previous = function () {
  var highlighted = this.highlighted
  if (!highlighted) return
  return this.highlight(prev(highlighted.el, '.Textcomplete-option'))
}

Textcomplete.prototype.find = function (el) {
  return closest(el, '.Textcomplete-option', true)
}

function remove(el) {
  el.parentNode.removeChild(el)
}

function stop(e) {
  e.preventDefault()
  e.stopPropagation()
}