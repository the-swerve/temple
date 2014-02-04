
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
require.register("temple/index.js", function(exports, require, module){
var utils =  require('./lib/utils');
var config = require('./lib/config');
var Environment = require('./lib/environment');

temple = function(model) {
	if (!(this instanceof temple)) { return new temple(model); }
	this.model = model;
	this.envs = [];
	this.before_render_callbacks = [];
	this.after_render_callbacks = [];
};

temple.prototype.render = function(el) {
	var nodes = [];
	if (el.length > 0) {
		nodes = el;
	} else if (el.nodeType > 0) { //IE<9 has no Node
		nodes = [el];
	} else {
		throw TypeError("temple requires a Node, array of Nodes, or a NodeList");
	}

	this.envs = [];
	for (var i = 0; i < nodes.length; ++i) {
		var env = new Environment(nodes[i]);
		this.envs.push(env);
		env.render(this.model);
	}
	return this;
};

temple.prototype.clear = function() {
	for (var i = 0; i < this.envs.length; ++i) {
		this.envs[i].clear(this.model);
	}
	this.envs = [];
	return this;
};

temple.config = function(options) {
	for (var attr in options) {
		config[attr] = options[attr];
	}
};

module.exports = temple;

});
require.register("temple/lib/attr_sub.js", function(exports, require, module){
/* Insert data in the attribute of an element
 *
 * Example:
 * html: <p dj-id='property_name'></p>
 *
 * data: {property_name: 'bananas'}
 *
 * result: <p id='bananas'></p>
 */
var Interpolation = require('./interpolation');
var utils = require('./utils');

var AttrSub = function(node, full_prop, attr) {
	this.node = node;
	this.full_prop = full_prop;
	this.props = full_prop.split('.');
	this.attr = attr;
	this.subscribed = false;
};

AttrSub.prototype = new Interpolation();

AttrSub.prototype.render = function(model) {
	this.subscribe(model);
	var val = utils.apply_properties(model, this.props);
	// If it's dj-class='property', then we'll want to append to that element's
	// classNames rather than overwriting them.
	if (this.attr === 'class') {
		if (this.node.className.indexOf(val) === -1) { // Element doesn't already have that class
			this.node.className = (this.node.className === '') ? val : this.node.className + ' ' + val;
		} // if
	} else { // Just write or overwrite that element's attribute
		this.node.setAttribute(this.attr, val);
	}

	return this;
};

AttrSub.prototype.clear = function(model) {
	this.node.setAttribute(config.prefix + this.attr, this.full_prop);
	this.unsubscribe(model);
	return this;
};

module.exports = AttrSub;

});
require.register("temple/lib/conditional.js", function(exports, require, module){
/*
 * Conditionals do not evaluate any properties within their node unless the
 * conditional property is true. This allows the user to make references to
 * objects within objects that may or may not be defined without throwing
 * errors.
 *
 * Example: user comments
 * var el = domify('<p data-text='name'></p><p data-if='comment' data-text='comment.content'></p>');
 * var user = {name: 'bob'};
 * temple(user).render('p');
 *
 * In the above example, the second p node will not render and
 * data-text='comment.content' will not be evaluated, since user does not have
 * a comment.
 */ 

var Interpolation = require('./interpolation');
var utils = require('./utils');
var config = require('./config');

var Conditional = function(node, full_prop, nested) {
	this.node = node;
	this.full_prop = full_prop;
	this.props = full_prop.split('.');
	this.shown = true;

	// We save a reference to the parent and create a placeholder node so that we
	// can swap our conditional element in and out of the dom.
	this.parent_node = this.node.parentNode;
	this.placeholder = document.createTextNode("");

	/* We have to do a dependency injection because there's circular dependence
	 * between Environment and Conditional. Environment needs to construct Conditionals when it
	 * traverses the DOM, and the Conditional needs to construct Environments for its
	 * child nodes.
	 */
	this.nested = nested;
};

Conditional.prototype = new Interpolation();

Conditional.prototype.render = function(model) {
	this.subscribe(model);
	var val = utils.apply_properties(model, this.props);
	if (val && !this.shown) {
		this.parent_node.replaceChild(this.node, this.placeholder);
		this.nested.render(model);
		this.shown = true;
	} else if (this.shown) {
		this.parent_node.replaceChild(this.placeholder, this.node);
		this.shown = false;
	}
	return this;
};

Conditional.prototype.clear = function(model) {
	this.node.setAttribute(config.prefix + config.conditional, this.full_prop);
	this.unsubscribe(model);
	return this;
};

module.exports = Conditional;

});
require.register("temple/lib/config.js", function(exports, require, module){
var config = module.exports = Object;

config.subscribe = function(model, property, render_function) {
	model.on('change ' + property, render_function);
};

config.unsubscribe = function(model, property, render_function) {
	model.off('change ' + property, render_function);
};

config.get = function(model, property) {
	return model[property];
};

config.conditional = 'if'; // conditional attribute postfix keyword

config.loop = 'each'; // loop attribute postfix keyword

config.text = 'text'; // text attribute postfix keyword

config.prefix = 'data-'; // attribute prefix keyword

});
require.register("temple/lib/environment.js", function(exports, require, module){
/*
 * An Environment is an array of Interpolations.
 *
 * One Environment is created for each DOM node that our data is rendered into.
 */

var TextSub = require('./text_sub');
var AttrSub = require('./attr_sub');
var Conditional = require('./conditional');
var Loop = require('./loop');
var config = require('./config');

var Environment = function(parent_node) {
	var stack = [parent_node];
	this.interps = [];
	while (stack.length > 0) {
		var current_node = stack.pop();
		var result = traverse_attrs(current_node);
		if (result.interps.length > 0) this.interps = this.interps.concat(result.interps);
		if (result.children.length > 0) stack = stack.concat(result.children);
	}
	return this;
};

Environment.prototype.render = function(data) {
	for (var i = 0; i < this.interps.length; ++i) {
		this.interps[i].render(data);
	}
	return this;
};

Environment.prototype.clear = function(model) {
	for (var i = 0; i < this.interps.length; ++i) {
		this.interps[i].clear(model);
	}
	return this;
};

module.exports = Environment;

// Functional utilities
// ---

// Given a node, find all temple attributes. Return an array of interpolations
// for each one found. Also return an array of children that we need to
// traverse (children of Conditionals, Loops, and Texts are not traversed).
var traverse_attrs = function(node) {
	var ob = {interps: [], children: []};
	if (node.nodeType !== 1) { // 1 == ElementNode
		return ob;
	}
	var cond = node.getAttribute(config.prefix + config.conditional);
	if (cond) {
		ob.interps.push(create_cond(node, cond));
		return ob;
	}
	var loop = node.getAttribute(config.prefix + config.loop);
	if (loop) {
		ob.interps.push(create_loop(node, loop));
		return ob;
	}
	var text = node.getAttribute(config.prefix + config.text);
	if (text) {
		ob.interps.push(create_text_sub(node, text));
	} else {
		// Traverse children (only if we don't have any of conditional, loop, and text)
		var children = node.childNodes;
		if (children) {
			for (var i = 0; i < children.length; ++i) {
				ob.children.push(children[i]);
			}
		}
	}
	// Get all remaining attr interps
	var attrs = node.attributes;
	for (var i = 0; i < attrs.length; ++i) {
		if (attrs[i].name.indexOf(config.prefix) === 0) {
			ob.interps.push(create_attr_sub(node, attrs[i].value, attrs[i].name));
		}
	}
	return ob;
};

// Create a Loop interpolation from a node with a 'loop' attribute
var create_loop = function(node, attr_value) {
	var prop = prepare_node(node, attr_value, config.prefix + config.loop);
	return new Loop(node, prop, Environment);
};

// Create a Conditional interpolation from a node with an 'if' attribute
var create_cond = function(node, attr_value) {
	var prop = prepare_node(node, attr_value, config.prefix + config.conditional);
	var env = new Environment(node);
	return new Conditional(node, prop, env);
};

// Create a new TextSub interpolation from a node with a 'text' attribute
var create_text_sub = function(node, attr_value) {
	var prop = prepare_node(node, attr_value, config.prefix + config.text);
	return new TextSub(node, prop);
};

// Create an AttrSub for anything that isn't the above
var create_attr_sub = function(node, attr) {
	var prop = prepare_node(node, attr.value, attr.name);
	var attr_name = attr.name.replace(prefix, ''); // remove the templating prefix
	return new AttrSub(node, prop, attr_name);
};

// Remove the attr with attr_name from the node and return the property from
// attr_value with any whitespace removed 
var prepare_node = function(node, attr_value, attr_name) {
	node.removeAttribute(attr_name);
	return attr_value.replace(/\s+/g, '');
};

});
require.register("temple/lib/interpolation.js", function(exports, require, module){
/* 
 * An Interpolation is a template action in your HTML -- either a text
 * substitution (TextSub), attribute substitution (AttrSub), a loop (Loop), or
 * a conditional (Conditional)
 *
 * This is the parent prototype to the above things so would contain any common
 * functionality for them.
 */

var config = require('./config');

var interpolation = module.exports = function() {};

/* 
 * Subscribe to emitted events from the data model.
 * Default is 'change <property>'
 */
interpolation.prototype.subscribe = function(model) {
	if (!this.subscribed && model.on && model.on instanceof Function) {
		var self = this;
		this.change_fn = function() { self.render(model); };
		config.subscribe(model, this.full_prop, this.change_fn);
		this.subscribed = true;
	}
	return this;
};

interpolation.prototype.unsubscribe = function(model) {
	if (this.subscribed && model.off && model.off instanceof Function) {
		config.unsubscribe(model, this.full_prop, this.change_fn);
		this.subscribed = false;
	}
	return this;
};

});
require.register("temple/lib/loop.js", function(exports, require, module){
/*
 * Loops will iterate through arrays in the data model and repeat Nodes in your
 * DOM for each element in the array.
 *
 * Loops have their own child environments for each element in the array.
 *
 * They are somewhat more complicated than the other Interpolations because
 * they have child environments, can be nested within one another, and sync the
 * data to the dom without re-rendering anything.
 */

var Interpolation = require('./interpolation');
var utils = require('./utils');
var config = require('./config');

var Loop = function(node, prop, env) {
	this.node = node;
	this.parent_node = node.parentNode;
	this.marker = document.createTextNode("");
	this.parent_node.replaceChild(this.marker, this.node);
	this.full_prop = prop;
	this.props = prop.split('.');
	this.nodes = [];
	this.Environment = env; // dependency injection
	this.subscribed = false;
};

Loop.prototype = new Interpolation();

Loop.prototype.render = function(model) {
	this.subscribe(model);
	var arr = utils.apply_properties(model, this.props);
	if (!arr || !(arr instanceof Array)) return
	// Remove existing nodes
	for (var i = 0; i < this.nodes.length; ++i) {
		this.parent_node.removeChild(this.nodes[i]);
	}
	this.nodes = []
	// Render all elements
	for (var i = 0; i < arr.length; ++i) {
		var scoped = typeof arr[i] === 'object' ? arr[i] : {each: arr[i]};
		var node = this.node.cloneNode(true);
		var env = new this.Environment(node);
		this.parent_node.insertBefore(node, this.marker);
		env.render(scoped, node);
		this.nodes.push(node);
	}
	return this;
};

Loop.prototype.clear = function(model) {
	this.node.setAttribute(config.prefix + config.loop, this.full_prop);
	for (var k = 0; k < this.nodes.length; ++k) {
		this.parent_node.removeChild(this.nodes[k]);
	}
	this.unsubscribe(model);
	return this;
}

module.exports = Loop;

});
require.register("temple/lib/text_sub.js", function(exports, require, module){
/* Substitute the text node of an element with data.
 *
 * Example:
 * html: <p data-text>property_name</p>
 *
 * data: {property_name: 'bananas'}
 *
 * result: <p>bananas</p>
 */
var Interpolation = require('./interpolation');
var utils = require('./utils');
var config = require('./config');

var TextSub = function(node, props) {
	this.constructor(node, props);
	this.node = node;
	this.full_prop = props;
	this.props = props.split('.');
	this.subscribed = false;
};

TextSub.prototype = new Interpolation();

TextSub.prototype.render = function(model) {
	this.subscribe(model);
	var val = utils.apply_properties(model, this.props);
	if (val) {
		this.node.innerHTML = val;
	}
	return this;
};

TextSub.prototype.clear = function(model) {
	this.node.setAttribute(config.prefix + config.text, this.full_prop);
	this.unsubscribe(model);
	return this;
};

module.exports = TextSub;

});
require.register("temple/lib/utils.js", function(exports, require, module){
var config = require ('./config');
var utils = module.exports = {};

utils.apply_properties = function(obj, props) {
	var val = obj;
	for (var i = 0; i < props.length; ++i) {
		val = config.get(val, props[i]);
	}
	return val;
};

});
require.alias("temple/index.js", "temple/index.js");