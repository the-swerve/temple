
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
require.register("deja/index.js", Function("exports, require, module",
"var utils =  require('./lib/utils');\n\
var config = require('./lib/config');\n\
var Environment = require('./lib/environment');\n\
\n\
var deja = module.exports = {};\n\
\n\
deja.view = function(model) {\n\
\tif (!(this instanceof deja.view)) { return new deja.view(model); }\n\
\tthis.model = model;\n\
\tthis.envs = [];\n\
\tthis.before_render_callbacks = [];\n\
\tthis.after_render_callbacks = [];\n\
};\n\
\n\
deja.view.prototype.render = function(el) {\n\
\tvar nodes = [];\n\
\tif (el.length > 0) {\n\
\t\tnodes = el;\n\
\t} else if (el.nodeType > 0) { //IE<9 has no Node\n\
\t\tnodes = [el];\n\
\t} else {\n\
\t\tthrow TypeError(\"deja.view requires a Node, array of Nodes, or a NodeList\");\n\
\t}\n\
\n\
\tthis.envs = [];\n\
\tfor (var i = 0; i < nodes.length; ++i) {\n\
\t\tvar env = new Environment(nodes[i]);\n\
\t\tthis.envs.push(env);\n\
\t\tenv.render(this.model);\n\
\t}\n\
\treturn this;\n\
};\n\
\n\
deja.view.prototype.clear = function() {\n\
\tfor (var i = 0; i < this.envs.length; ++i) {\n\
\t\tthis.envs[i].clear(this.model);\n\
\t}\n\
\tthis.envs = [];\n\
\treturn this;\n\
};\n\
\n\
deja.config = function(options) {\n\
\tfor (var attr in options) {\n\
\t\tconfig[attr] = options[attr];\n\
\t}\n\
};\n\
//@ sourceURL=deja/index.js"
));
require.register("deja/lib/attr_sub.js", Function("exports, require, module",
"/* Insert data in the attribute of an element\n\
 *\n\
 * Example:\n\
 * html: <p dj-id='property_name'></p>\n\
 *\n\
 * data: {property_name: 'bananas'}\n\
 *\n\
 * result: <p id='bananas'></p>\n\
 */\n\
var Interpolation = require('./interpolation');\n\
var utils = require('./utils');\n\
\n\
var AttrSub = module.exports = function(node, full_prop, attr) {\n\
\tthis.node = node;\n\
\tthis.full_prop = full_prop;\n\
\tthis.props = full_prop.split('.');\n\
\tthis.attr = attr;\n\
\tthis.subscribed = false;\n\
};\n\
\n\
AttrSub.prototype = new Interpolation();\n\
\n\
AttrSub.prototype.render = function(model) {\n\
\tthis.subscribe(model);\n\
\tvar val = utils.apply_properties(model, this.props);\n\
\t// If it's dj-class='property', then we'll want to append to that element's\n\
\t// classNames rather than overwriting them.\n\
\tif (this.attr === 'class') {\n\
\t\tif (this.node.className.indexOf(val) === -1) { // Element doesn't already have that class\n\
\t\t\tthis.node.className = (this.node.className === '') ? val : this.node.className + ' ' + val;\n\
\t\t} // if\n\
\t} else { // Just write or overwrite that element's attribute\n\
\t\tthis.node.setAttribute(this.attr, val);\n\
\t}\n\
\tthis.node.removeAttribute('dj-' + this.attr);\n\
\n\
\treturn this;\n\
};\n\
\n\
AttrSub.prototype.clear = function(model) {\n\
\tthis.node.setAttribute('dj-' + this.attr, this.full_prop);\n\
\tthis.unsubscribe(model);\n\
\treturn this;\n\
};\n\
//@ sourceURL=deja/lib/attr_sub.js"
));
require.register("deja/lib/config.js", Function("exports, require, module",
"var config = module.exports = Object;\n\
\n\
config.subscribe = function(model, property, render_function) {\n\
\tmodel.on('change ' + property, render_function);\n\
};\n\
\n\
config.unsubscribe = function(model, property, render_function) {\n\
\tmodel.off('change ' + property, render_function);\n\
};\n\
\n\
config.get = function(model, property) {\n\
\treturn model[property];\n\
};\n\
\n\
config.prefix = 'dj-';\n\
//@ sourceURL=deja/lib/config.js"
));
require.register("deja/lib/environment.js", Function("exports, require, module",
"/*\n\
 * An Environment is an array of Interpolations.\n\
 *\n\
 * One Environment is created for each DOM node that our data is rendered into.\n\
 */\n\
\n\
var TextSub = require('./text_sub');\n\
var AttrSub = require('./attr_sub');\n\
var Loop = require('./loop');\n\
var config = require('./config');\n\
\n\
var Environment = module.exports = function(parent_node) {\n\
\tvar stack = [parent_node];\n\
\tvar prefix = config.prefix;\n\
\tthis.interpolations = [];\n\
\n\
\t/* Recurse through the DOM tree, using a stack starting at the given node.\n\
\t * Find any instances of prefixed attributes and create the matching\n\
\t * Interpolation.\n\
\t */\n\
\twhile (stack.length > 0) {\n\
\t\tvar current_node = stack.pop();\n\
\t\tvar traverse_children = true; // flag whether to stop at the current node.\n\
\t\t// Ignore all non-element nodes\n\
\t\tif (current_node.nodeType === 1) {\n\
\t\t\t// First check for a loop, which takes precedence and scopes everything else within it.\n\
\t\t\tvar loop = current_node.getAttribute(prefix + 'each');\n\
\t\t\tif (loop) {\n\
\t\t\t\tcurrent_node.removeAttribute(prefix + 'each');\n\
\t\t\t\tthis.interpolations.push(new Loop(current_node, loop, Environment));\n\
\t\t\t\ttraverse_children = false;\n\
\t\t\t} else {\n\
\t\t\t\tvar text = current_node.getAttribute(prefix + 'text');\n\
\t\t\t\tif (text) {\n\
\t\t\t\t\tcurrent_node.removeAttribute(prefix + 'text');\n\
\t\t\t\t\tthis.interpolations.push(new TextSub(current_node, text.replace(/\\s+/g,'')));\n\
\t\t\t\t\ttraverse_children = false;\n\
\t\t\t\t}\n\
\t\t\t\t// Find all other deja attributes that aren't texts/loops\n\
\t\t\t\tvar attrs = current_node.attributes;\n\
\t\t\t\tfor (var i = 0; i < attrs.length; ++i) {\n\
\t\t\t\t\tif (attrs[i].name.indexOf(prefix) === 0) {\n\
\t\t\t\t\t\tvar attr_name = attrs[i].name.replace(prefix, '');\n\
\t\t\t\t\t\tthis.interpolations.push(new AttrSub(current_node, attrs[i].value, attr_name));\n\
\t\t\t\t\t}\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\n\
\t\tif (traverse_children) {\n\
\t\t\tvar children = current_node.childNodes;\n\
\t\t\tif (children) {\n\
\t\t\t\tfor (var j = 0; j < children.length; ++j) {\n\
\t\t\t\t\tstack.push(children[j]);\n\
\t\t\t\t}\n\
\t\t\t}\n\
\t\t}\n\
\t} // while\n\
\n\
\treturn this;\n\
};\n\
\n\
var parse_attrs = function(node, interps) {\n\
};\n\
\n\
Environment.prototype.render = function(data) {\n\
\tfor (var i = 0; i < this.interpolations.length; ++i) {\n\
\t\tthis.interpolations[i].render(data);\n\
\t}\n\
\treturn this;\n\
};\n\
\n\
Environment.prototype.clear = function(model) {\n\
\tfor (var i = 0; i < this.interpolations.length; ++i) {\n\
\t\tthis.interpolations[i].clear(model);\n\
\t}\n\
\treturn this;\n\
};\n\
//@ sourceURL=deja/lib/environment.js"
));
require.register("deja/lib/interpolation.js", Function("exports, require, module",
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
//@ sourceURL=deja/lib/interpolation.js"
));
require.register("deja/lib/loop.js", Function("exports, require, module",
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
var Interpolation = require('./interpolation');\n\
var utils = require('./utils');\n\
var config = require('./config');\n\
\n\
var Loop = module.exports = function(node, prop, env_constructor) {\n\
\tthis.node = node;\n\
\tthis.parent_node = node.parentNode;\n\
\tthis.full_prop = prop;\n\
\tthis.props = prop.split('.');\n\
\tthis.subscribed = false;\n\
\tthis.child_interps = [];\n\
\n\
\t/* We have to do a dependency injection because there's circular dependence\n\
\t * between Environment and Loop. Environment needs to construct Loops when it\n\
\t * traverses the Dom, and the Loop needs to construct Environments for its\n\
\t * child nodes.\n\
\t */\n\
\tthis.Environment = env_constructor;\n\
};\n\
\n\
Loop.prototype = new Interpolation();\n\
\n\
Loop.prototype.render = function(model) {\n\
\tthis.subscribe(model);\n\
\tthis.node.style.display = 'none';\n\
\n\
\tvar arr = utils.apply_properties(model, this.props);\n\
\tif (!arr || !(arr instanceof Array)) {\n\
\t\treturn; // arrays only plez\n\
\t}\n\
\n\
\t// Sync all the data with the existing nodes.\n\
\t// TODO -- what if the array is resorted? Then we'd ideally want the DOM\n\
\t// nodes to be resorted to reflect the new order rather than changing the\n\
\t// data in the existing DOM node order.\n\
\t// eg: <i data-checked>1</i>, <i>2</i>, <i>3</i>\n\
\t// user reverses array, and we should get:\n\
\t// eg: <i>3</i>, <i>2</i>, <i data-checked>1</i>\n\
\t// instead, the current version gives us:\n\
\t// eg: <i data-checked>3</i>, <i>2</i>, <i>1</i>\n\
\t// as you can see, the dynamic state 'data-checked' is moved to the node with\n\
\t// '3' on data update when it was meant for '1'.\n\
\tfor (var i = 0; i < arr.length; ++i) {\n\
\t\tvar existing = this.child_interps[i];\n\
\t\tvar scoped = {each: arr[i]};\n\
\t\tif (existing) {\n\
\t\t\texisting.env.render(scoped);\n\
\t\t} else {\n\
\t\t\tvar new_node = this.node.cloneNode(true);\n\
\t\t\tnew_node.style.display = '';\n\
\t\t\tvar new_env = new this.Environment(new_node);\n\
\t\t\tthis.parent_node.insertBefore(new_node, this.node);\n\
\t\t\tnew_env.render(scoped);\n\
\t\t\tthis.child_interps[i] = {node: new_node, env: new_env};\n\
\t\t}\n\
\t}\n\
\n\
\t// Remove any extra nodes.\n\
\tif (this.child_interps.length > arr.length) {\n\
\t\tfor (var j = this.child_interps.length - 1; j >= arr.length; --j) {\n\
\t\t\tthis.parent_node.removeChild(this.child_interps[j].node);\n\
\t\t\tthis.child_interps.splice(j, 1);\n\
\t\t}\n\
\t}\n\
\n\
\treturn this;\n\
};\n\
\n\
Loop.prototype.clear = function(model) {\n\
\tthis.node.setAttribute(config.prefix + 'each', this.full_prop);\n\
\tfor (var k = 0; k < this.child_interps.length; ++k) {\n\
\t\tthis.parent_node.removeChild(this.child_interps[k].node);\n\
\t}\n\
\tthis.unsubscribe(model);\n\
\treturn this;\n\
};\n\
//@ sourceURL=deja/lib/loop.js"
));
require.register("deja/lib/text_sub.js", Function("exports, require, module",
"/* Substitute the text node of an element with data.\n\
 *\n\
 * Example:\n\
 * html: <p dj-text>property_name</p>\n\
 *\n\
 * data: {property_name: 'bananas'}\n\
 *\n\
 * result: <p>bananas</p>\n\
 */\n\
var Interpolation = require('./interpolation');\n\
var utils = require('./utils');\n\
var config = require('./config');\n\
\n\
var TextSub = module.exports = function(node, props) {\n\
\tthis.constructor(node, props);\n\
\tthis.node = node;\n\
\tthis.full_prop = props;\n\
\tthis.props = props.split('.');\n\
\tthis.subscribed = false;\n\
};\n\
\n\
TextSub.prototype = new Interpolation();\n\
\n\
TextSub.prototype.render = function(model) {\n\
\tthis.subscribe(model);\n\
\tvar val = utils.apply_properties(model, this.props);\n\
\tif (val) {\n\
\t\tthis.node.innerHTML = val;\n\
\t}\n\
\treturn this;\n\
};\n\
\n\
TextSub.prototype.clear = function(model) {\n\
\tthis.node.setAttribute(config.prefix + 'text', this.full_prop);\n\
\tthis.unsubscribe(model);\n\
\treturn this;\n\
};\n\
//@ sourceURL=deja/lib/text_sub.js"
));
require.register("deja/lib/utils.js", Function("exports, require, module",
"var config = require ('./config');\n\
var utils = module.exports = {};\n\
\n\
utils.apply_properties = function(obj, props) {\n\
\tvar val = obj;\n\
\tfor (var i = 0; i < props.length; ++i) {\n\
\t\tval = config.get(val, props[i]);\n\
\t}\n\
\treturn val;\n\
};\n\
//@ sourceURL=deja/lib/utils.js"
));
require.alias("deja/index.js", "deja/index.js");
