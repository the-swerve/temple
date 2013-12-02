;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var utils =  require('./lib/utils.js');
environment = require('./lib/environment.js');

deja = Object;

deja.view = function(model) {
	if (!(this instanceof deja.view)) { return new deja.view(model); }
	this.model = model;
};

deja.view.prototype.render = function(query_string) {
	var nodes = document.querySelectorAll(query_string);
	this.envs = this.envs || [];
	for (var i = 0; i < nodes.length; ++i) {
		var env = environment(nodes[i]);
		this.envs.push(env);
		env.render(this.model);
	}
	return this;
};

module.exports = deja;

},{"./lib/environment.js":4,"./lib/utils.js":8}],2:[function(require,module,exports){
/* Insert data in the attribute of an element
 *
 * Example:
 * html: <p deja-id='property_name'></p>
 *
 * data: {property_name: 'bananas'}
 *
 * result: <p id='bananas'></p>
 */
var interpolation = require('./interpolation');

var attr_sub = function(node, props, attr) {
	if (!(this instanceof attr_sub)) { return new attr_sub(node, props, attr); }
	this.node = node;
	this.full_prop = props;
	this.props = props.split('.');
	this.attr = attr;
	this.subscribed = false;
}

attr_sub.prototype = new interpolation;

attr_sub.prototype.render = function(model) {
	if (!this.subscribed && model.on && model.on instanceof Function) {
		this.subscribe(model);
	}
	var val = utils.apply_array_of_props(model, this.props);
	if (this.attr === 'class') {
		if (this.node.className.indexOf(val) === -1) {
			if (this.node.className !== '') {
				this.node.className += ' ' + val;
			} else {
				this.node.className = val;
			}
		} // if
	} else {
		this.node.setAttribute(this.attr, val);
	}

	this.node.removeAttribute('deja-' + this.attr);
	return this;
};

module.exports = attr_sub;

},{"./interpolation":5}],3:[function(require,module,exports){
var interpolation = require('./interpolation');

var conditional = function(node, props) {
	if (!(this instanceof conditional)) { return new conditional(node, props); }
	this.node = node
	this.full_prop = props;
	this.props = props.split('.');
}

conditional.prototype = new interpolation;

conditional.prototype.render = function(model) {
	this.subscribe(model);
	var val = utils.apply_array_of_props(model, this.props);
	this.node.style.display = val ? '' : 'none';
	return this;
};

module.exports = conditional;

},{"./interpolation":5}],4:[function(require,module,exports){
var text_sub = require('./text_sub');
var attr_sub = require('./attr_sub');
var loop = require('./loop');
var conditional = require('./conditional');

var environment = function(parent_node) {
	if (!(this instanceof environment)) { return new environment(parent_node); }
	var stack = [parent_node];
	this.interpolations = [];

	/* Iteratively recurse through the DOM tree starting at the given node and
	 * find any instances of deja attribute substitutions, text substitutions,
	 * loops, or conditionals */
	while (stack.length > 0) {
		var current_node = stack.pop();
		var traverse_children = true; // flag whether to stop at this node.
		var attrs = current_node.attributes;
		if (attrs) {
			for (var i = 0; i < attrs.length; ++i) {
				if (attrs[i].name.indexOf('deja-') === 0) {
					if (attrs[i].name === 'deja-text') {
						this.interpolations.push(text_sub(current_node, current_node.innerHTML));
						traverse_children = false;
					} else if (attrs[i].name === 'deja-loop') {
						var each_name = current_node.getAttribute('deja-as') || 'this';
						this.interpolations.push(loop(current_node, attrs[i].value, each_name));
						traverse_children = false;
						break;
					} else if (attrs[i].name === 'deja-visible') {
						this.interpolations.push(conditional(current_node, attrs[i].value));
					} else if (attrs[i].name === 'deja-as') {
						// pass
					} else {
						var new_attr_name = attrs[i].name.replace('deja-', '');
						this.interpolations.push(attr_sub(current_node, attrs[i].value, new_attr_name));
					}
				}
			} // for
		} // if

		if (traverse_children) {
			var children = current_node.childNodes;
			if (children) {
				for (var i = 0; i < children.length; ++i) {
					stack.push(children[i]);
				}
			}
		}

	} // while
	return this;
};

environment.prototype.render = function(model) {
	for (var i = 0; i < this.interpolations.length; ++i) {
		this.interpolations[i].render(model);
	}
	return this;
};

module.exports = environment;

},{"./attr_sub":2,"./conditional":3,"./loop":6,"./text_sub":7}],5:[function(require,module,exports){
/* 
 * This is the parent prototype to text_sub, attr_sub, loop, and conditional
 */

var interpolation = function() { };

interpolation.prototype.subscribe = function(model) {
	if (!this.subscribed && model.on && model.on instanceof Function) {
		var self = this;
		model.on('change ' + this.full_prop, function() {
			self.render(model);
		});
		this.subscribed = true;
	}
	return this;
};

module.exports = interpolation;

},{}],6:[function(require,module,exports){
var interpolation = require('./interpolation');

var loop = function(node, props, each_name) {
	if (!(this instanceof loop)) { return new loop(node, props, each_name); }
	this.node = node;
	this.parent_node = node.parentNode;
	this.full_prop = props;
	this.props = props.split('.');
	this.each_name = each_name;
	this.subscribed = false;
	this.child_interps = [];
}

loop.prototype = new interpolation;

loop.prototype.render = function(model) {
	this.subscribe(model);
	this.node.removeAttribute('deja-loop');
	this.node.removeAttribute('deja-as');
	this.node.style.display = 'none';

	var arr = utils.apply_array_of_props(model, this.props);
	if (!arr || !(arr instanceof Array)) return; // arrays only plez

	for (var i = 0; i < arr.length; ++i) {
		var existing = this.child_interps[i];
		var scoped = {};
		scoped[this.each_name] = arr[i];
		if (existing) {
			existing.env.render(scoped);
		} else {
			var new_node = this.node.cloneNode(true);
			new_node.style.display = '';
			var new_env = environment(new_node);
			this.parent_node.insertBefore(new_node, this.node);
			new_env.render(scoped);
			this.child_interps[i] = {node: new_node, env: new_env};
		}
	} // for

	// Remove extra nodes if the array was shortened
	if (this.child_interps.length > arr.length) {
		for (var i = this.child_interps.length - 1; i >= arr.length; --i) {
			this.parent_node.removeChild(this.child_interps[i].node);
			this.child_interps.splice(i, 1);
		}
	}

	return this;
};

module.exports = loop;

},{"./interpolation":5}],7:[function(require,module,exports){
/* Substitute the text node of an element with data.
 *
 * Example:
 * html: <p deja-text>property_name</p>
 *
 * data: {property_name: 'bananas'}
 *
 * result: <p>bananas</p>
 */
var interpolation = require('./interpolation');

var text_sub = function(node, props) {
	if (!(this instanceof text_sub)) { return new text_sub(node, props); }
	this.constructor(node, props);
	this.node = node;
	this.full_prop = props;
	this.props = props.split('.');
	this.subscribed = false;
}

text_sub.prototype = new interpolation();

text_sub.prototype.render = function(model) {
	this.subscribe(model);
	var val = utils.apply_array_of_props(model, this.props);
	this.node.innerHTML = val;
	this.node.removeAttribute('deja-text');
	return this;
};

module.exports = text_sub;

},{"./interpolation":5}],8:[function(require,module,exports){
utils = Object;

utils.extend = function(xs, ys) {
	for (var key in ys) {
		xs[key] = ys[key];
	}
	return xs;
};

utils.nodelist_to_array = function(nodes) {
	var arr = [];
	for(var i = 0, n; n = nodes[i]; ++i) arr.push(n);
};

utils.apply_array_of_props = function(obj, props) {
	if (props.length > 0) {
		var val = obj[props[0]];
	} else {
		return obj;
	}
	for (var i = 1; i < props.length; ++i) {
		val = val[props[i]];
	}
	return val;
};

module.exports = utils;

},{}],9:[function(require,module,exports){
var Emitter = require('emitter');

var ArrayModel = function(Type, init, parent) {
    if (!(this instanceof ArrayModel)) {
        return new ArrayModel(Type, init, parent);
    }

    var self = this;
    Array.call(this);

    self._Type = Type;

    if (init) {
        init.forEach(self.push.bind(self));
    }

    Object.defineProperty(self, '_parent', {
        get: function() {
            return parent;
        }
    })
};

ArrayModel.prototype = new Array();

Emitter(ArrayModel.prototype);

ArrayModel.prototype.toJSON = function() {
    return Array.prototype.slice.call(this);
};

ArrayModel.prototype.push = function(obj) {
    var self = this;

    var val = self._Type(obj);
    if (typeof val === 'object') {
        Object.defineProperty(val, 'parent', {
            get: function() {
                return self._parent;
            }
        });
    }

    Array.prototype.push.call(self, val);

    self.emit('add', val);
    return val;
};

module.exports = ArrayModel;

},{"emitter":17}],10:[function(require,module,exports){
var Emitter = require('emitter');
var xtend = require('xtend');

var ArrayModel = require('./array_model');

var Model = function(schema, opt) {
    opt = opt || {};
    schema = schema || {};

    var properties = Object.keys(schema);

    // sync function for CRUD
    var sync = opt.sync;

    var Construct = function(initial) {
        if (!(this instanceof Construct)) {
            return new Construct(initial);
        }

        Emitter.call(this);

        var self = this;

        // default state is saved
        self._saved = true;

        // basepath for the url
        self.url_root = Construct.url_root;

        if (initial) {
            self.id = initial.id;
        }

        // url property can be used to overrride the model's url
        var _url = undefined;
        Object.defineProperty(self, 'url', {
            get: function() {
                // if user explicitly set, return their value
                if (_url) {
                    return _url;
                }

                if (self.is_new()) {
                    return self.url_root;
                }

                return self.url_root + '/' + self.id;
            },
            set: function(val) {
                _url = val;
            }
        });

        properties.forEach(function(prop) {
            var config = schema[prop];

            var prop_val = (initial) ? initial[prop] : undefined;

            if (config instanceof Array) {
                var item = config[0];

                // shit... so in this case, we don't need a submodel
                // the issue is we have created a Model for each item
                // but, our model does not get the proper url rool
                if (typeof item === 'object') {
                    prop_val = ArrayModel(Model(item, opt), prop_val, self);
                }
                else {
                    prop_val = ArrayModel(item, prop_val, self);
                }
            }

            var is_constructor = (config instanceof Function);

            if (prop_val && is_constructor && !(prop_val instanceof config)) {
                prop_val = config(prop_val);
            }

            // create an object wrapper, this lets us emit events
            // when internal properties are set
            function inner_obj(key_path, props, initial) {
                var properties = {};
                initial = initial || {};

                Object.keys(props).forEach(function(key) {
                    var path = key_path + '.' + key;
                    var value_holder = initial[key];

                    properties[key] = {
                        enumerable: true,
                        get: function() {
                            return value_holder;
                        },
                        set: function(val) {
                            var old = value_holder;
                            value_holder = val;
                            self.emit('change ' + path, val, old);
                        }
                    }
                });

                var proto = null;
                return Object.create(proto, properties);
            }

            if (config instanceof Function) {
                // see if it has keys
                Object.defineProperty(self, prop, {
                    enumerable: true,
                    get: function() {
                        return prop_val;
                    },
                    set: function(val) {
                        var old = prop_val;

                        // this handles the case of setting via same object
                        // we don't need to call constructor
                        if (val instanceof config) {
                            prop_val = val
                        }
                        else {
                            prop_val = config(val);
                        }

                        self._saved = false;
                        self.emit('change ' + prop, prop_val, old);
                    }
                });

                return;
            }

            // user specified an inner object
            // but don't do this for arrays
            var keys = Object.keys(config);
            if ( !(config instanceof Array) && keys.length > 0) {
                // no value set by default
                if (prop_val) {
                    prop_val = inner_obj(prop, config, prop_val);
                }

                // if the nothing above captured and config is a regular object
                // see if it has keys
                Object.defineProperty(self, prop, {
                    enumerable: true,
                    get: function() {
                        return prop_val;
                    },
                    set: function(val) {
                        var old = prop_val;
                        prop_val = inner_obj(prop, config, val);
                        self._saved = false;

                        self.emit('change ' + prop, prop_val, old);
                    }
                });

                return;
            }

            // if the nothing above captured and config is a single valueish
            Object.defineProperty(self, prop, {
                enumerable: true,
                get: function() {
                    return prop_val;
                },
                set: function(val) {
                    var old = prop_val;
                    prop_val = val;
                    self._saved = false;
                    self.emit('change ' + prop, prop_val, old);
                }
            });
        });
    };

    Emitter(Construct.prototype);

    Construct.url_root = opt.url_root;

    Construct.prototype.toJSON = function() {
        var self = this;
        var obj = {};

        properties.forEach(function(prop) {
            if (!self[prop]) {
                return;
            }

            obj[prop] = self[prop];
        });

        return obj;
    };

    // if the model has an ID property, then it is not considered new
    Construct.prototype.is_new = function() {
        var self = this;
        return !self.id;
    };

    // return true if the model state has been persistent to the server
    // false for 'is_new()' or if a property has changed since last sync
    Construct.prototype.is_saved = function() {
        var self = this;
        return !self.is_new() && self._saved;
    };

    Construct.prototype.save = function(cb) {
        var self = this;

        cb = cb || function() {};

        var sync_opt = {
            url: self.url,
            method: 'PUT',
            body: self
        };

        var is_new = self.is_new();
        sync_opt.method = is_new ? 'POST' : 'PUT';

        sync(sync_opt, function(err, result) {
            if (err) {
                return cb(err);
            }

            // only expect id back if new
            // for updating existing we don't do this?
            if (is_new) {
                self.id = result.id;
            }

            return cb(null);
        });
    };

    Construct.prototype.fetch = function(cb) {
        var self = this;

        // nothing to fetch if we don't have an id
        if (!self.id) {
            return;
        }

        var sync_opt = {
            url: self.url_root + '/' + self.id,
            method: 'GET'
        };

        sync(sync_opt, function(err, result) {
            if (err) {
                return cb(err);
            }

            // set our properties
            for (var key in result) {
                self[key] = result[key];
            }

            return cb(null);
        });
    };

    Construct.prototype.destroy = function(cb) {
        var self = this;
        // model was never saved to server
        if (self.is_new()) {
            return;
        }

        var sync_opt = {
            url: self.url,
            method: 'DELETE'
        };

        sync(sync_opt, function(err) {
            if (err) {
                return cb(err);
            }

            self.emit('destroy');
            cb(null);
        });
    };

    /// Class functions

    // get a single Model instance by id
    Construct.get = function(id, cb) {
        var self = this;

        var sync_opt = {
            url: self.url_root + '/' + id,
            method: 'GET'
        };

        sync(sync_opt, function(err, result) {
            if (err) {
                return cb(err);
            }

            return cb(null, Construct(result));
        });
    };

    // query for a list of Models
    // @param [Object] query optional query object
    Construct.find = function(query, cb) {
        var self = this;

        if (typeof query === 'function') {
            cb = query;
            query = {}
        }

        var sync_opt = {
            url: self.url_root,
            query: query,
            method: 'GET'
        };

        sync(sync_opt, function(err, result) {
            if (err) {
                return cb(err);
            }

            return cb(null, result.map(Construct));
        });
    };

    // copy this model and optionally mixin some new shit
    Construct.extend = function(more_schema, more_opt) {
        more_schema = more_schema || {};
        more_opt = more_opt || {};
        return Model(xtend(schema, more_schema), xtend(opt, more_opt));
    };

    return Construct;
};

module.exports = Model;

},{"./array_model":9,"emitter":17,"xtend":12}],11:[function(require,module,exports){
module.exports = hasKeys

function hasKeys(source) {
    return source !== null &&
        (typeof source === "object" ||
        typeof source === "function")
}

},{}],12:[function(require,module,exports){
var Keys = require("object-keys")
var hasKeys = require("./has-keys")

module.exports = extend

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        if (!hasKeys(source)) {
            continue
        }

        var keys = Keys(source)

        for (var j = 0; j < keys.length; j++) {
            var name = keys[j]
            target[name] = source[name]
        }
    }

    return target
}

},{"./has-keys":11,"object-keys":14}],13:[function(require,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

var isFunction = function (fn) {
	var isFunc = (typeof fn === 'function' && !(fn instanceof RegExp)) || toString.call(fn) === '[object Function]';
	if (!isFunc && typeof window !== 'undefined') {
		isFunc = fn === window.setTimeout || fn === window.alert || fn === window.confirm || fn === window.prompt;
	}
	return isFunc;
};

module.exports = function forEach(obj, fn) {
	if (!isFunction(fn)) {
		throw new TypeError('iterator must be a function');
	}
	var i, k,
		isString = typeof obj === 'string',
		l = obj.length,
		context = arguments.length > 2 ? arguments[2] : null;
	if (l === +l) {
		for (i = 0; i < l; i++) {
			if (context === null) {
				fn(isString ? obj.charAt(i) : obj[i], i, obj);
			} else {
				fn.call(context, isString ? obj.charAt(i) : obj[i], i, obj);
			}
		}
	} else {
		for (k in obj) {
			if (hasOwn.call(obj, k)) {
				if (context === null) {
					fn(obj[k], k, obj);
				} else {
					fn.call(context, obj[k], k, obj);
				}
			}
		}
	}
};


},{}],14:[function(require,module,exports){
module.exports = Object.keys || require('./shim');


},{"./shim":16}],15:[function(require,module,exports){
var toString = Object.prototype.toString;

module.exports = function isArguments(value) {
	var str = toString.call(value);
	var isArguments = str === '[object Arguments]';
	if (!isArguments) {
		isArguments = str !== '[object Array]'
			&& value !== null
			&& typeof value === 'object'
			&& typeof value.length === 'number'
			&& value.length >= 0
			&& toString.call(value.callee) === '[object Function]';
	}
	return isArguments;
};


},{}],16:[function(require,module,exports){
(function () {
	"use strict";

	// modified from https://github.com/kriskowal/es5-shim
	var has = Object.prototype.hasOwnProperty,
		toString = Object.prototype.toString,
		forEach = require('./foreach'),
		isArgs = require('./isArguments'),
		hasDontEnumBug = !({'toString': null}).propertyIsEnumerable('toString'),
		hasProtoEnumBug = (function () {}).propertyIsEnumerable('prototype'),
		dontEnums = [
			"toString",
			"toLocaleString",
			"valueOf",
			"hasOwnProperty",
			"isPrototypeOf",
			"propertyIsEnumerable",
			"constructor"
		],
		keysShim;

	keysShim = function keys(object) {
		var isObject = object !== null && typeof object === 'object',
			isFunction = toString.call(object) === '[object Function]',
			isArguments = isArgs(object),
			theKeys = [];

		if (!isObject && !isFunction && !isArguments) {
			throw new TypeError("Object.keys called on a non-object");
		}

		if (isArguments) {
			forEach(object, function (value) {
				theKeys.push(value);
			});
		} else {
			var name,
				skipProto = hasProtoEnumBug && isFunction;

			for (name in object) {
				if (!(skipProto && name === 'prototype') && has.call(object, name)) {
					theKeys.push(name);
				}
			}
		}

		if (hasDontEnumBug) {
			var ctor = object.constructor,
				skipConstructor = ctor && ctor.prototype === object;

			forEach(dontEnums, function (dontEnum) {
				if (!(skipConstructor && dontEnum === 'constructor') && has.call(object, dontEnum)) {
					theKeys.push(dontEnum);
				}
			});
		}
		return theKeys;
	};

	module.exports = keysShim;
}());


},{"./foreach":13,"./isArguments":15}],17:[function(require,module,exports){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{"indexof":18}],18:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],19:[function(require,module,exports){
var deja = require('../');
var Model = require('bamboo/model');
var emitter = require('emitter-component');

var App = Model({
	greeting: {
		message: String
	},
	name: String,
	id: Number,
	class: String,
	walruses: [{first_name: String, last_name: String, comments: [String], cool: Boolean}],
	cond_a: Boolean,
	cond_b: Boolean,
	basic_list: [Number]
});

app = App();

app.greeting = {message: 'Hallo welt'};
app.name = 'Bob Ross';
app.id = 420;
app.class = 'greeting-thing';
app.walruses = [
	{first_name: 'Benedict', last_name: 'Frulth', comments: ['lol', 'wat'], cool: true},
	{first_name: 'Hecuba', last_name: 'Gerbil', comments: ['hi', 'hello', 'greetings'], cool: false},
	{first_name: 'Henry', last_name: 'Grimp', comments: ['where am i?'], cool: true}
];
app.basic_list = [1, 2, 3, 4];
app.cond_a = true;
app.cond_b = false;

var test = deja.view(app);

test.render('#greeting');

setTimeout(function() {
	app.name = 'Bill Clinton';
}, 3000);

setTimeout(function() {
	console.log('changing basic list');
	app.basic_list = [6,7,8];
}, 1000);

},{"../":1,"bamboo/model":10,"emitter-component":17}]},{},[19])
;