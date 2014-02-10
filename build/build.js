
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-stack/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `stack()`.\n\
 */\n\
\n\
module.exports = stack;\n\
\n\
/**\n\
 * Return the stack.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
function stack() {\n\
  var orig = Error.prepareStackTrace;\n\
  Error.prepareStackTrace = function(_, stack){ return stack; };\n\
  var err = new Error;\n\
  Error.captureStackTrace(err, arguments.callee);\n\
  var stack = err.stack;\n\
  Error.prepareStackTrace = orig;\n\
  return stack;\n\
}//@ sourceURL=component-stack/index.js"
));
require.register("jkroso-type/index.js", Function("exports, require, module",
"\n\
/**\n\
 * refs\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Return the type of `val`.\n\
 *\n\
 * @param {Mixed} val\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(v){\n\
  // .toString() is slow so try avoid it\n\
  return typeof v === 'object'\n\
    ? types[toString.call(v)]\n\
    : typeof v\n\
};\n\
\n\
var types = {\n\
  '[object Function]': 'function',\n\
  '[object Date]': 'date',\n\
  '[object RegExp]': 'regexp',\n\
  '[object Arguments]': 'arguments',\n\
  '[object Array]': 'array',\n\
  '[object String]': 'string',\n\
  '[object Null]': 'null',\n\
  '[object Undefined]': 'undefined',\n\
  '[object Number]': 'number',\n\
  '[object Boolean]': 'boolean',\n\
  '[object Object]': 'object',\n\
  '[object Text]': 'textnode',\n\
  '[object Uint8Array]': '8bit-array',\n\
  '[object Uint16Array]': '16bit-array',\n\
  '[object Uint32Array]': '32bit-array',\n\
  '[object Uint8ClampedArray]': '8bit-array',\n\
  '[object Error]': 'error'\n\
}\n\
\n\
if (typeof window != 'undefined') {\n\
  for (var el in window) if (/^HTML\\w+Element$/.test(el)) {\n\
    types['[object '+el+']'] = 'element'\n\
  }\n\
}\n\
\n\
module.exports.types = types\n\
//@ sourceURL=jkroso-type/index.js"
));
require.register("jkroso-equals/index.js", Function("exports, require, module",
"\n\
var type = require('type')\n\
\n\
/**\n\
 * assert all values are equal\n\
 *\n\
 * @param {Any} [...]\n\
 * @return {Boolean}\n\
 */\n\
\n\
module.exports = function(){\n\
\tvar i = arguments.length - 1\n\
\twhile (i > 0) {\n\
\t\tif (!compare(arguments[i], arguments[--i])) return false\n\
\t}\n\
\treturn true\n\
}\n\
\n\
// (any, any, [array]) -> boolean\n\
function compare(a, b, memos){\n\
\t// All identical values are equivalent\n\
\tif (a === b) return true\n\
\tvar fnA = types[type(a)]\n\
\tif (fnA !== types[type(b)]) return false\n\
\treturn fnA ? fnA(a, b, memos) : false\n\
}\n\
\n\
var types = {}\n\
\n\
// (Number) -> boolean\n\
types.number = function(a){\n\
\t// NaN check\n\
\treturn a !== a\n\
}\n\
\n\
// (function, function, array) -> boolean\n\
types['function'] = function(a, b, memos){\n\
\treturn a.toString() === b.toString()\n\
\t\t// Functions can act as objects\n\
\t  && types.object(a, b, memos) \n\
\t\t&& compare(a.prototype, b.prototype)\n\
}\n\
\n\
// (date, date) -> boolean\n\
types.date = function(a, b){\n\
\treturn +a === +b\n\
}\n\
\n\
// (regexp, regexp) -> boolean\n\
types.regexp = function(a, b){\n\
\treturn a.toString() === b.toString()\n\
}\n\
\n\
// (DOMElement, DOMElement) -> boolean\n\
types.element = function(a, b){\n\
\treturn a.outerHTML === b.outerHTML\n\
}\n\
\n\
// (textnode, textnode) -> boolean\n\
types.textnode = function(a, b){\n\
\treturn a.textContent === b.textContent\n\
}\n\
\n\
// decorate `fn` to prevent it re-checking objects\n\
// (function) -> function\n\
function memoGaurd(fn){\n\
\treturn function(a, b, memos){\n\
\t\tif (!memos) return fn(a, b, [])\n\
\t\tvar i = memos.length, memo\n\
\t\twhile (memo = memos[--i]) {\n\
\t\t\tif (memo[0] === a && memo[1] === b) return true\n\
\t\t}\n\
\t\treturn fn(a, b, memos)\n\
\t}\n\
}\n\
\n\
types['arguments'] =\n\
types.array = memoGaurd(compareArrays)\n\
\n\
// (array, array, array) -> boolean\n\
function compareArrays(a, b, memos){\n\
\tvar i = a.length\n\
\tif (i !== b.length) return false\n\
\tmemos.push([a, b])\n\
\twhile (i--) {\n\
\t\tif (!compare(a[i], b[i], memos)) return false\n\
\t}\n\
\treturn true\n\
}\n\
\n\
types.object = memoGaurd(compareObjects)\n\
\n\
// (object, object, array) -> boolean\n\
function compareObjects(a, b, memos) {\n\
\tvar ka = getEnumerableProperties(a)\n\
\tvar kb = getEnumerableProperties(b)\n\
\tvar i = ka.length\n\
\n\
\t// same number of properties\n\
\tif (i !== kb.length) return false\n\
\n\
\t// although not necessarily the same order\n\
\tka.sort()\n\
\tkb.sort()\n\
\n\
\t// cheap key test\n\
\twhile (i--) if (ka[i] !== kb[i]) return false\n\
\n\
\t// remember\n\
\tmemos.push([a, b])\n\
\n\
\t// iterate again this time doing a thorough check\n\
\ti = ka.length\n\
\twhile (i--) {\n\
\t\tvar key = ka[i]\n\
\t\tif (!compare(a[key], b[key], memos)) return false\n\
\t}\n\
\n\
\treturn true\n\
}\n\
\n\
// (object) -> array\n\
function getEnumerableProperties (object) {\n\
\tvar result = []\n\
\tfor (var k in object) if (k !== 'constructor') {\n\
\t\tresult.push(k)\n\
\t}\n\
\treturn result\n\
}\n\
\n\
// expose compare\n\
module.exports.compare = compare\n\
//@ sourceURL=jkroso-equals/index.js"
));
require.register("component-assert/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var stack = require('stack');\n\
var equals = require('equals');\n\
\n\
/**\n\
 * Assert `expr` with optional failure `msg`.\n\
 *\n\
 * @param {Mixed} expr\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
module.exports = exports = function (expr, msg) {\n\
  if (expr) return;\n\
  throw new Error(message());\n\
};\n\
\n\
/**\n\
 * Assert `actual` is weak equal to `expected`.\n\
 *\n\
 * @param {Mixed} actual\n\
 * @param {Mixed} expected\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
exports.equal = function (actual, expected, msg) {\n\
  if (actual == expected) return;\n\
  throw new Error(message());\n\
};\n\
\n\
/**\n\
 * Assert `actual` is not weak equal to `expected`.\n\
 *\n\
 * @param {Mixed} actual\n\
 * @param {Mixed} expected\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
exports.notEqual = function (actual, expected, msg) {\n\
  if (actual != expected) return;\n\
  throw new Error(message());\n\
};\n\
\n\
/**\n\
 * Assert `actual` is deep equal to `expected`.\n\
 *\n\
 * @param {Mixed} actual\n\
 * @param {Mixed} expected\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
exports.deepEqual = function (actual, expected, msg) {\n\
  if (equals(actual, expected)) return;\n\
  throw new Error(message());\n\
};\n\
\n\
/**\n\
 * Assert `actual` is not deep equal to `expected`.\n\
 *\n\
 * @param {Mixed} actual\n\
 * @param {Mixed} expected\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
exports.notDeepEqual = function (actual, expected, msg) {\n\
  if (!equals(actual, expected)) return;\n\
  throw new Error(message());\n\
};\n\
\n\
/**\n\
 * Assert `actual` is strict equal to `expected`.\n\
 *\n\
 * @param {Mixed} actual\n\
 * @param {Mixed} expected\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
exports.strictEqual = function (actual, expected, msg) {\n\
  if (actual === expected) return;\n\
  throw new Error(message());\n\
};\n\
\n\
/**\n\
 * Assert `actual` is not strict equal to `expected`.\n\
 *\n\
 * @param {Mixed} actual\n\
 * @param {Mixed} expected\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
exports.notStrictEqual = function (actual, expected, msg) {\n\
  if (actual !== expected) return;\n\
  throw new Error(message());\n\
};\n\
\n\
/**\n\
 * Assert `block` throws an `error`.\n\
 *\n\
 * @param {Function} block\n\
 * @param {Function} [error]\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
exports.throws = function (block, error, msg) {\n\
  var err;\n\
  try {\n\
    block();\n\
  } catch (e) {\n\
    err = e;\n\
  }\n\
  if (!err) throw new Error(message());\n\
  if (error && !(err instanceof error)) throw new Error(message());\n\
};\n\
\n\
/**\n\
 * Assert `block` doesn't throw an `error`.\n\
 *\n\
 * @param {Function} block\n\
 * @param {Function} [error]\n\
 * @param {String} [msg]\n\
 * @api public\n\
 */\n\
\n\
exports.doesNotThrow = function (block, error, msg) {\n\
  var err;\n\
  try {\n\
    block();\n\
  } catch (e) {\n\
    err = e;\n\
  }\n\
  if (error && (err instanceof error)) throw new Error(message());\n\
  if (err) throw new Error(message());\n\
};\n\
\n\
/**\n\
 * Create a message from the call stack.\n\
 *\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function message() {\n\
  if (!Error.captureStackTrace) return 'assertion failed';\n\
  var callsite = stack()[2];\n\
  var fn = callsite.getFunctionName();\n\
  var file = callsite.getFileName();\n\
  var line = callsite.getLineNumber() - 1;\n\
  var col = callsite.getColumnNumber() - 1;\n\
  var src = getScript(file);\n\
  line = src.split('\\n\
')[line].slice(col);\n\
  return line.match(/assert\\((.*)\\)/)[1].trim();\n\
}\n\
\n\
/**\n\
 * Load contents of `script`.\n\
 *\n\
 * @param {String} script\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function getScript(script) {\n\
  var xhr = new XMLHttpRequest;\n\
  xhr.open('GET', script, false);\n\
  xhr.send(null);\n\
  return xhr.responseText;\n\
}//@ sourceURL=component-assert/index.js"
));
require.register("component-domify/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `parse`.\n\
 */\n\
\n\
module.exports = parse;\n\
\n\
/**\n\
 * Wrap map from jquery.\n\
 */\n\
\n\
var map = {\n\
  legend: [1, '<fieldset>', '</fieldset>'],\n\
  tr: [2, '<table><tbody>', '</tbody></table>'],\n\
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n\
  _default: [0, '', '']\n\
};\n\
\n\
map.td =\n\
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];\n\
\n\
map.option =\n\
map.optgroup = [1, '<select multiple=\"multiple\">', '</select>'];\n\
\n\
map.thead =\n\
map.tbody =\n\
map.colgroup =\n\
map.caption =\n\
map.tfoot = [1, '<table>', '</table>'];\n\
\n\
map.text =\n\
map.circle =\n\
map.ellipse =\n\
map.line =\n\
map.path =\n\
map.polygon =\n\
map.polyline =\n\
map.rect = [1, '<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\">','</svg>'];\n\
\n\
/**\n\
 * Parse `html` and return the children.\n\
 *\n\
 * @param {String} html\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function parse(html) {\n\
  if ('string' != typeof html) throw new TypeError('String expected');\n\
  \n\
  // tag name\n\
  var m = /<([\\w:]+)/.exec(html);\n\
  if (!m) return document.createTextNode(html);\n\
\n\
  html = html.replace(/^\\s+|\\s+$/g, ''); // Remove leading/trailing whitespace\n\
\n\
  var tag = m[1];\n\
\n\
  // body support\n\
  if (tag == 'body') {\n\
    var el = document.createElement('html');\n\
    el.innerHTML = html;\n\
    return el.removeChild(el.lastChild);\n\
  }\n\
\n\
  // wrap map\n\
  var wrap = map[tag] || map._default;\n\
  var depth = wrap[0];\n\
  var prefix = wrap[1];\n\
  var suffix = wrap[2];\n\
  var el = document.createElement('div');\n\
  el.innerHTML = prefix + html + suffix;\n\
  while (depth--) el = el.lastChild;\n\
\n\
  // one element\n\
  if (el.firstChild == el.lastChild) {\n\
    return el.removeChild(el.firstChild);\n\
  }\n\
\n\
  // several elements\n\
  var fragment = document.createDocumentFragment();\n\
  while (el.firstChild) {\n\
    fragment.appendChild(el.removeChild(el.firstChild));\n\
  }\n\
\n\
  return fragment;\n\
}\n\
//@ sourceURL=component-domify/index.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `Emitter`.\n\
 */\n\
\n\
module.exports = Emitter;\n\
\n\
/**\n\
 * Initialize a new `Emitter`.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Emitter(obj) {\n\
  if (obj) return mixin(obj);\n\
};\n\
\n\
/**\n\
 * Mixin the emitter properties.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function mixin(obj) {\n\
  for (var key in Emitter.prototype) {\n\
    obj[key] = Emitter.prototype[key];\n\
  }\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Listen on the given `event` with `fn`.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.on =\n\
Emitter.prototype.addEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
  (this._callbacks[event] = this._callbacks[event] || [])\n\
    .push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Adds an `event` listener that will be invoked a single\n\
 * time then automatically removed.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.once = function(event, fn){\n\
  var self = this;\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  function on() {\n\
    self.off(event, on);\n\
    fn.apply(this, arguments);\n\
  }\n\
\n\
  on.fn = fn;\n\
  this.on(event, on);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove the given callback for `event` or all\n\
 * registered callbacks.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.off =\n\
Emitter.prototype.removeListener =\n\
Emitter.prototype.removeAllListeners =\n\
Emitter.prototype.removeEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  // all\n\
  if (0 == arguments.length) {\n\
    this._callbacks = {};\n\
    return this;\n\
  }\n\
\n\
  // specific event\n\
  var callbacks = this._callbacks[event];\n\
  if (!callbacks) return this;\n\
\n\
  // remove all handlers\n\
  if (1 == arguments.length) {\n\
    delete this._callbacks[event];\n\
    return this;\n\
  }\n\
\n\
  // remove specific handler\n\
  var cb;\n\
  for (var i = 0; i < callbacks.length; i++) {\n\
    cb = callbacks[i];\n\
    if (cb === fn || cb.fn === fn) {\n\
      callbacks.splice(i, 1);\n\
      break;\n\
    }\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Emit `event` with the given args.\n\
 *\n\
 * @param {String} event\n\
 * @param {Mixed} ...\n\
 * @return {Emitter}\n\
 */\n\
\n\
Emitter.prototype.emit = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  var args = [].slice.call(arguments, 1)\n\
    , callbacks = this._callbacks[event];\n\
\n\
  if (callbacks) {\n\
    callbacks = callbacks.slice(0);\n\
    for (var i = 0, len = callbacks.length; i < len; ++i) {\n\
      callbacks[i].apply(this, args);\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return array of callbacks for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.listeners = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  return this._callbacks[event] || [];\n\
};\n\
\n\
/**\n\
 * Check if this emitter has `event` handlers.\n\
 *\n\
 * @param {String} event\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.hasListeners = function(event){\n\
  return !! this.listeners(event).length;\n\
};\n\
//@ sourceURL=component-emitter/index.js"
));
require.register("temple/index.js", Function("exports, require, module",
"var utils =  require('./lib/utils')\n\
var config = require('./lib/config')\n\
var Environment = require('./lib/environment')\n\
\n\
temple = function(model) {\n\
\tif (!(this instanceof temple)) { return new temple(model); }\n\
\tthis.model = model\n\
\tthis.envs = []\n\
\tthis.before_render_callbacks = []\n\
\tthis.after_render_callbacks = []\n\
}\n\
\n\
temple.prototype.render = function(el) {\n\
\tvar nodes = []\n\
\tif (el.length > 0) {\n\
\t\tnodes = el\n\
\t} else if (el.nodeType > 0) { //IE<9 has no Node\n\
\t\tnodes = [el]\n\
\t} else {\n\
\t\tthrow TypeError(\"temple requires a Node, array of Nodes, or a NodeList\")\n\
\t}\n\
\n\
\tthis.envs = []\n\
\tfor (var i = 0; i < nodes.length; ++i) {\n\
\t\tvar env = new Environment(nodes[i])\n\
\t\tthis.envs.push(env)\n\
\t\tenv.render(this.model)\n\
\t}\n\
\treturn this\n\
}\n\
\n\
temple.prototype.clear = function() {\n\
\tfor (var i = 0; i < this.envs.length; ++i) {\n\
\t\tthis.envs[i].clear(this.model)\n\
\t}\n\
\tthis.envs = []\n\
\treturn this\n\
}\n\
\n\
temple.config = function(options) {\n\
\tfor (var attr in options) {\n\
\t\tconfig[attr] = options[attr]\n\
\t}\n\
}\n\
\n\
module.exports = temple\n\
//@ sourceURL=temple/index.js"
));
require.register("temple/lib/attr_sub.js", Function("exports, require, module",
"/* Insert data in the attribute of an element\n\
 *\n\
 * Example:\n\
 * html: <p dj-id='property_name'></p>\n\
 *\n\
 * data: {property_name: 'bananas'}\n\
 *\n\
 * result: <p id='bananas'></p>\n\
 */\n\
var Interpolation = require('./interpolation')\n\
var utils = require('./utils')\n\
\n\
var AttrSub = function(node, full_prop, attr) {\n\
\tthis.node = node\n\
\tthis.full_prop = full_prop\n\
\tthis.props = full_prop.split('.')\n\
\tthis.attr = attr\n\
\tthis.subscribed = false\n\
}\n\
\n\
AttrSub.prototype = new Interpolation()\n\
\n\
AttrSub.prototype.render = function(model) {\n\
\tvar val = this.get_val(model)\n\
\tthis.subscribe(model)\n\
\t// If it's dj-class='property', then we'll want to append to that element's\n\
\t// classNames rather than overwriting them.\n\
\tif (this.attr === 'class') {\n\
\t\tif (this.node.className.indexOf(val) === -1) { // Element doesn't already have that class\n\
\t\t\tthis.node.className = (this.node.className === '') ? val : this.node.className + ' ' + val\n\
\t\t} // if\n\
\t} else { // Just write or overwrite that element's attribute\n\
\t\tthis.node.setAttribute(this.attr, val)\n\
\t}\n\
\n\
\treturn this\n\
}\n\
\n\
AttrSub.prototype.clear = function(model) {\n\
\tthis.node.setAttribute(config.prefix + this.attr, this.full_prop)\n\
\tthis.unsubscribe(model)\n\
\treturn this\n\
}\n\
\n\
module.exports = AttrSub\n\
//@ sourceURL=temple/lib/attr_sub.js"
));
require.register("temple/lib/conditional.js", Function("exports, require, module",
"/*\n\
 * Conditionals do not evaluate any properties within their node unless the\n\
 * conditional property is true. This allows the user to make references to\n\
 * objects within objects that may or may not be defined without throwing\n\
 * errors.\n\
 *\n\
 * Example: user comments\n\
 * var el = domify('<p data-text='name'></p><p data-if='comment' data-text='comment.content'></p>')\n\
 * var user = {name: 'bob'}\n\
 * temple(user).render('p')\n\
 *\n\
 * In the above example, the second p node will not render and\n\
 * data-text='comment.content' will not be evaluated, since user does not have\n\
 * a comment.\n\
 */ \n\
\n\
var Interpolation = require('./interpolation')\n\
var utils = require('./utils')\n\
var config = require('./config')\n\
\n\
var Conditional = function(node, full_prop, nested, inverted) {\n\
\tthis.node = node\n\
\tthis.full_prop = full_prop\n\
\tthis.props = full_prop.split('.')\n\
\tthis.shown = false\n\
\n\
\t// Inverted denotes whether this is an inverse_conditional ('tmpl-unless')\n\
\tthis.inverted = inverted\n\
\n\
\t// We save a reference to the parent and create a placeholder node so that we\n\
\t// can swap our conditional element in and out of the dom.\n\
\tthis.parent_node = this.node.parentNode\n\
\tthis.placeholder = document.createTextNode(\"\")\n\
\tthis.parent_node.replaceChild(this.placeholder, this.node)\n\
\n\
\t/* We have to do a dependency injection because there's circular dependence\n\
\t * between Environment and Conditional. Environment needs to construct Conditionals when it\n\
\t * traverses the DOM, and the Conditional needs to construct Environments for its\n\
\t * child nodes.\n\
\t */\n\
\tthis.nested = nested\n\
}\n\
\n\
Conditional.prototype = new Interpolation()\n\
\n\
Conditional.prototype.render = function(model) {\n\
\tvar val = this.get_val(model)\n\
\tthis.subscribe(model)\n\
\tvar test = this.inverted ? !Boolean(val) : Boolean(val)\n\
\tif (test && !this.shown) {\n\
\t\tthis.parent_node.replaceChild(this.node, this.placeholder)\n\
\t\tthis.nested.render(model)\n\
\t\tthis.shown = true\n\
\t} else if (this.shown && !test) {\n\
\t\tthis.parent_node.replaceChild(this.placeholder, this.node)\n\
\t\tthis.shown = false\n\
\t} else {\n\
\t}\n\
\treturn this\n\
}\n\
\n\
Conditional.prototype.clear = function(model) {\n\
\tthis.node.setAttribute(config.prefix + config.conditional, this.full_prop)\n\
\tthis.unsubscribe(model)\n\
\treturn this\n\
}\n\
\n\
module.exports = Conditional\n\
//@ sourceURL=temple/lib/conditional.js"
));
require.register("temple/lib/config.js", Function("exports, require, module",
"var config = {\n\
\tconditional: 'if',\n\
\tinverse_conditional: 'unless',\n\
\tloop: 'each',\n\
\ttext: 'text',\n\
\tprefix: 'tmpl-'\n\
}\n\
\n\
config.subscribe = function(model, property, render_function) {\n\
\tmodel.on('change ' + property, render_function)\n\
}\n\
\n\
config.unsubscribe = function(model, property, render_function) {\n\
\tmodel.off('change ' + property, render_function)\n\
}\n\
\n\
config.get = function(model, property) {\n\
\treturn model[property]\n\
}\n\
\n\
config.len = function(collection) {\n\
\treturn collection.length\n\
}\n\
\n\
config.index = function(collection, i) {\n\
\treturn collection[i]\n\
}\n\
\n\
module.exports = config\n\
//@ sourceURL=temple/lib/config.js"
));
require.register("temple/lib/environment.js", Function("exports, require, module",
"/*\n\
 * An Environment is an array of Interpolations.\n\
 *\n\
 * One Environment is created for each DOM node that our data is rendered into.\n\
 */\n\
\n\
var TextSub = require('./text_sub');\n\
var AttrSub = require('./attr_sub');\n\
var Conditional = require('./conditional');\n\
var Loop = require('./loop');\n\
var config = require('./config');\n\
\n\
var Environment = function(parent_node) {\n\
\tvar stack = [parent_node];\n\
\tthis.interps = [];\n\
\twhile (stack.length > 0) {\n\
\t\tvar current_node = stack.pop();\n\
\t\tvar result = traverse_attrs(current_node);\n\
\t\tif (result.interps.length > 0) this.interps = this.interps.concat(result.interps);\n\
\t\tif (result.children.length > 0) stack = stack.concat(result.children);\n\
\t}\n\
\treturn this;\n\
};\n\
\n\
Environment.prototype.render = function(data) {\n\
\tfor (var i = 0; i < this.interps.length; ++i) {\n\
\t\tthis.interps[i].render(data);\n\
\t}\n\
\treturn this;\n\
};\n\
\n\
Environment.prototype.clear = function(model) {\n\
\tfor (var i = 0; i < this.interps.length; ++i) {\n\
\t\tthis.interps[i].clear(model);\n\
\t}\n\
\treturn this;\n\
};\n\
\n\
module.exports = Environment;\n\
\n\
// # Functional utilities\n\
\n\
// Given a node, find all temple attributes. Return an array of interpolations\n\
// for each one found. Also return an array of children that we need to\n\
// traverse (children of Conditionals, Loops, and Texts are not traversed).\n\
var traverse_attrs = function(node) {\n\
\tvar ob = {interps: [], children: []};\n\
\tif (node.nodeType !== 1) { // 1 == ElementNode\n\
\t\treturn ob;\n\
\t}\n\
\tvar cond = node.getAttribute(config.prefix + config.conditional);\n\
\tif (cond) {\n\
\t\tob.interps.push(create_cond(node, cond, config.prefix + config.conditional, false));\n\
\t\treturn ob;\n\
\t}\n\
\tvar unless = node.getAttribute(config.prefix + config.inverse_conditional);\n\
\tif (unless) {\n\
\t\tob.interps.push(create_cond(node, unless, config.prefix + config.inverse_conditional, true));\n\
\t\treturn ob;\n\
\t}\n\
\tvar loop = node.getAttribute(config.prefix + config.loop);\n\
\tif (loop) {\n\
\t\tob.interps.push(create_loop(node, loop));\n\
\t\treturn ob;\n\
\t}\n\
\tvar text = node.getAttribute(config.prefix + config.text);\n\
\tif (text) {\n\
\t\tob.interps.push(create_text_sub(node, text));\n\
\t} else {\n\
\t\t// Traverse children (only if we don't have any of conditional, loop, and text)\n\
\t\tvar children = node.childNodes;\n\
\t\tif (children) {\n\
\t\t\tfor (var i = 0; i < children.length; ++i) {\n\
\t\t\t\tob.children.push(children[i]);\n\
\t\t\t}\n\
\t\t}\n\
\t}\n\
\t// Get all remaining attr interps\n\
\tvar attrs = node.attributes;\n\
\tfor (var i = 0; i < attrs.length; ++i) {\n\
\t\tif (attrs[i].name.indexOf(config.prefix) === 0) {\n\
\t\t\tob.interps.push(create_attr_sub(node, attrs[i].value, attrs[i].name));\n\
\t\t}\n\
\t}\n\
\treturn ob;\n\
};\n\
\n\
// Create a Loop interpolation from a node with a 'loop' attribute\n\
var create_loop = function(node, attr_value) {\n\
\tvar prop = prepare_node(node, attr_value, config.prefix + config.loop);\n\
\treturn new Loop(node, prop, Environment);\n\
};\n\
\n\
// Create a Conditional interpolation from a node with an 'if' attribute\n\
var create_cond = function(node, attr_value, attr_name, inverted) {\n\
\tvar prop = prepare_node(node, attr_value, attr_name);\n\
\tvar env = new Environment(node);\n\
\treturn new Conditional(node, prop, env, inverted);\n\
};\n\
\n\
// Create a new TextSub interpolation from a node with a 'text' attribute\n\
var create_text_sub = function(node, attr_value) {\n\
\tvar prop = prepare_node(node, attr_value, config.prefix + config.text);\n\
\treturn new TextSub(node, prop);\n\
};\n\
\n\
// Create an AttrSub for anything that isn't the above\n\
var create_attr_sub = function(node, attr_value, attr_name) {\n\
\tvar prop = prepare_node(node, attr_value, attr_name);\n\
\tvar name = attr_name.replace(config.prefix, ''); // remove the templating prefix\n\
\treturn new AttrSub(node, prop, name);\n\
};\n\
\n\
// Remove the attr with attr_name from the node and return the property from\n\
// attr_value with any whitespace removed \n\
var prepare_node = function(node, attr_value, attr_name) {\n\
\tnode.removeAttribute(attr_name);\n\
\treturn attr_value.replace(/\\s+/g, '');\n\
};\n\
//@ sourceURL=temple/lib/environment.js"
));
require.register("temple/lib/interpolation.js", Function("exports, require, module",
"/* \n\
 * An Interpolation is a template action in your HTML -- either a text\n\
 * substitution (TextSub), attribute substitution (AttrSub), a loop (Loop), or\n\
 * a conditional (Conditional)\n\
 *\n\
 * This is the parent prototype to the above things so would contain any common\n\
 * functionality for them.\n\
 */\n\
\n\
var config = require('./config');\n\
var utils = require('./utils');\n\
\n\
var interpolation = module.exports = function() {};\n\
\n\
/* \n\
 * Subscribe to emitted events from the data model.\n\
 * Default is 'change <property>'\n\
 */\n\
interpolation.prototype.subscribe = function(model) {\n\
\tif (!this.subscribed && model.on && model.on instanceof Function) {\n\
\t\tvar self = this;\n\
\t\tthis.change_fn = function() { self.render(model); };\n\
\t\tconfig.subscribe(model, this.full_prop, this.change_fn);\n\
\t\tthis.subscribed = true;\n\
\t}\n\
\treturn this;\n\
};\n\
\n\
interpolation.prototype.unsubscribe = function(model) {\n\
\tif (this.subscribed && model.off && model.off instanceof Function) {\n\
\t\tconfig.unsubscribe(model, this.full_prop, this.change_fn);\n\
\t\tthis.subscribed = false;\n\
\t}\n\
\treturn this;\n\
};\n\
\n\
// If the model is a value rather than object, just use that.\n\
// Otherwise, we need to apply our saved array of properties to the object.\n\
interpolation.prototype.get_val = function(model) {\n\
\tif (typeof model !== 'object') return model\n\
\telse return utils.apply_properties(model, this.props)\n\
}\n\
//@ sourceURL=temple/lib/interpolation.js"
));
require.register("temple/lib/loop.js", Function("exports, require, module",
"/*\n\
 * Loops will iterate through arrays in the data model and repeat Nodes in your\n\
 * DOM for each element in the array.\n\
 *\n\
 * Loops have their own child environments for each element in the array.\n\
 *\n\
 * They are somewhat more complicated than the other Interpolations because\n\
 * they have child environments, can be nested within one another, and sync the\n\
 * data to the dom without re-rendering anything.\n\
 */\n\
\n\
var Interpolation = require('./interpolation')\n\
var utils = require('./utils')\n\
var config = require('./config')\n\
\n\
var Loop = function(node, prop, env) {\n\
\tthis.node = node\n\
\tthis.parent_node = node.parentNode\n\
\tthis.marker = document.createTextNode(\"\")\n\
\tthis.parent_node.replaceChild(this.marker, this.node)\n\
\tthis.full_prop = prop\n\
\tthis.props = prop.split('.')\n\
\tthis.nodes = []\n\
\tthis.Environment = env; // dependency injection\n\
\tthis.subscribed = false\n\
}\n\
\n\
Loop.prototype = new Interpolation()\n\
\n\
Loop.prototype.render = function(model) {\n\
\tvar arr = this.get_val(model)\n\
\tthis.subscribe(model)\n\
\tif (!arr) return\n\
\t// Remove existing nodes\n\
\tfor (var i = 0; i < this.nodes.length; ++i) {\n\
\t\tthis.parent_node.removeChild(this.nodes[i])\n\
\t}\n\
\tthis.nodes = []\n\
\t// Render all elements\n\
\tfor (var i = 0; i < config.len(arr); ++i) {\n\
\t\tvar val = config.index(arr, i)\n\
\t\tvar node = this.node.cloneNode(true)\n\
\t\tvar env = new this.Environment(node)\n\
\t\tthis.parent_node.insertBefore(node, this.marker)\n\
\t\tenv.render(val, node)\n\
\t\tthis.nodes.push(node)\n\
\t}\n\
\treturn this\n\
}\n\
\n\
Loop.prototype.clear = function(model) {\n\
\tthis.node.setAttribute(config.prefix + config.loop, this.full_prop)\n\
\tfor (var k = 0; k < this.nodes.length; ++k) {\n\
\t\tthis.parent_node.removeChild(this.nodes[k])\n\
\t}\n\
\tthis.unsubscribe(model)\n\
\treturn this\n\
}\n\
\n\
module.exports = Loop\n\
//@ sourceURL=temple/lib/loop.js"
));
require.register("temple/lib/text_sub.js", Function("exports, require, module",
"/* Substitute the text node of an element with data.\n\
 *\n\
 * Example:\n\
 * html: <p data-text>property_name</p>\n\
 *\n\
 * data: {property_name: 'bananas'}\n\
 *\n\
 * result: <p>bananas</p>\n\
 */\n\
var Interpolation = require('./interpolation')\n\
var utils = require('./utils')\n\
var config = require('./config')\n\
\n\
var TextSub = function(node, props) {\n\
\tthis.constructor(node, props)\n\
\tthis.node = node\n\
\tthis.full_prop = props\n\
\tthis.props = props.split('.')\n\
\tthis.subscribed = false\n\
}\n\
\n\
TextSub.prototype = new Interpolation()\n\
\n\
TextSub.prototype.render = function(model) {\n\
\tvar val = this.get_val(model)\n\
\tthis.subscribe(model)\n\
\tif (val !== undefined) this.node.innerHTML = val\n\
\treturn this\n\
}\n\
\n\
TextSub.prototype.clear = function(model) {\n\
\tthis.node.setAttribute(config.prefix + config.text, this.full_prop)\n\
\tthis.unsubscribe(model)\n\
\treturn this\n\
}\n\
\n\
module.exports = TextSub\n\
//@ sourceURL=temple/lib/text_sub.js"
));
require.register("temple/lib/utils.js", Function("exports, require, module",
"var config = require ('./config');\n\
var utils = module.exports = {};\n\
\n\
utils.apply_properties = function(obj, props) {\n\
\tvar val = obj;\n\
\tfor (var i = 0; i < props.length && val; ++i) {\n\
\t\tval = config.get(val, props[i]);\n\
\t}\n\
\treturn val;\n\
};\n\
//@ sourceURL=temple/lib/utils.js"
));








require.alias("component-assert/index.js", "temple/deps/assert/index.js");
require.alias("component-assert/index.js", "assert/index.js");
require.alias("component-stack/index.js", "component-assert/deps/stack/index.js");

require.alias("jkroso-equals/index.js", "component-assert/deps/equals/index.js");
require.alias("jkroso-type/index.js", "jkroso-equals/deps/type/index.js");

require.alias("component-domify/index.js", "temple/deps/domify/index.js");
require.alias("component-domify/index.js", "domify/index.js");

require.alias("component-emitter/index.js", "temple/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");

require.alias("temple/index.js", "temple/index.js");