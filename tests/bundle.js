;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
utils =  require('./lib/utils.js');
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

},{"./lib/environment.js":4,"./lib/utils.js":7}],2:[function(require,module,exports){

var attr_sub = function(node, props, attr) {
	if (!(this instanceof attr_sub)) { return new attr_sub(node, props, attr); }
	this.node = node;
	this.props = props.split('.');
	this.attr = attr;
}

attr_sub.prototype.render = function(data) {
	var val = utils.apply_array_of_props(data, this.props);
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

},{}],3:[function(require,module,exports){

var conditional = function() {
	if (!(this instanceof conditional)) { return new conditional(); }
}

conditional.prototype.render = function(data) {
	return this;
};

module.exports = conditional;

},{}],4:[function(require,module,exports){

var text_sub = require('./text_sub');
var attr_sub = require('./attr_sub');
var loop = require('./loop');
var conditional = require('./conditional');

var environment = function(parent_node) {
	if (!(this instanceof environment)) { return new environment(parent_node); }
	var stack = [parent_node];
	this.interpolations = [];

	while (stack.length > 0) {
		var current_node = stack.pop();
		var traverse_children = true;
		var attrs = current_node.attributes;
		if (attrs) {
			for (var i = 0; i < attrs.length; ++i) {
				if (attrs[i].name.indexOf('deja-') === 0) {
					if (attrs[i].name === 'deja-text') {
						this.interpolations.push(text_sub(current_node, current_node.innerHTML));
						traverse_children = false;
					} else if (attrs[i].name === 'deja-loop') {
						var each_name = current_node.getAttribute('deja-as');
						this.interpolations.push(loop(current_node, attrs[i].value, each_name));
						traverse_children = false;
						break;
					} else if (attrs[i].name === 'deja-as') {
						// pass
					} else if (attrs[i].name === 'deja-visible') {
						// todo
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
	console.log(this.interpolations);
	return this;
};

environment.prototype.render = function(data) {
	for (var i = 0; i < this.interpolations.length; ++i) {
		this.interpolations[i].render(data);
	}
	return this;
};

module.exports = environment;

},{"./attr_sub":2,"./conditional":3,"./loop":5,"./text_sub":6}],5:[function(require,module,exports){

var loop = function(node, props, each_name) {
	if (!(this instanceof loop)) { return new loop(node, props, each_name); }
	this.node = node;
	this.parent_node = node.parentNode;
	this.props = props.split('.');
	this.each_name = each_name;
	
	// Construct the environment for the all the children of this list
	node.removeAttribute('deja-loop');
	this.parent_node.removeChild(node);

	this.child_interps = [];
}

loop.prototype.render = function(data) {
	var arr = utils.apply_array_of_props(data, this.props);
	if (!arr || !(arr instanceof Array)) return; // arrays only plez

	for (var i = 0; i < arr.length; ++i) {
		var existing = this.child_interps[i];
		if (existing) {
			// todo
		} else {
			var new_node = this.node.cloneNode(true);
			var new_env = environment(new_node);
			console.log('new_env', new_env);
			this.parent_node.appendChild(new_node);
			this.child_interps[i] = [new_node, new_env];
			var scoped = {};
			scoped[this.each_name] = arr[i];
			console.log(scoped);
			new_env.render(scoped);
		}
	}

	/* 

	// Truncate our nodes if the list has been shortened.
	iterate(diff, null, function() {
		var last_child = loop_mapping.parent_node.lastChild;
		loop_mapping.parent_node.removeChild(last_child);
		loop_mapping.children.pop();
	});

	// Expand the number of repeated nodes if our list has been lengthened.
	iterate(-diff, null, function() {
		var clone = loop_mapping.template.cloneNode(true);
		loop_mapping.parent_node.appendChild(clone);
		var nested_environment = interpolate.initialize_template(clone);
		loop_mapping.children.push(nested_environment);
	});

	// Sync the data in the list with the properties in the dom.
	mff.map(list, function(elem, i) {
		var scoped_data = {};
		scoped_data[loop_mapping.elem] = elem;
		if (loop_mapping.children[i]) {
			// A node in the dom for this element exists; sync the data.
			interpolate.render(loop_mapping.children[i], scoped_data);
		} else {
			// Add a new node in the dom for this element.
			interpolate.render(nested_environment, scoped_data);
		}
	});
	*/
	return this;
};

module.exports = loop;

},{}],6:[function(require,module,exports){

var text_sub = function(node, props) {
	if (!(this instanceof text_sub)) { return new text_sub(node, props); }
	this.props = props.split('.');
	this.node = node;
}

text_sub.prototype.render = function(data) {
	var val = utils.apply_array_of_props(data, this.props);
	this.node.innerHTML = val;
	this.node.removeAttribute('deja-text');
	return this;
};

module.exports = text_sub;

},{}],7:[function(require,module,exports){

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

},{}],8:[function(require,module,exports){

var deja = require('../');

var test = deja.view({
	greeting: {message: 'Hallo welt'},
	name: 'Bob Ross',
	id: 420,
	class: 'greeting-thing',
	walruses: [
		{first_name: 'Benedict', last_name: 'Freypill'},
		{first_name: 'Hecuba', last_name: 'Gerbil'},
		{first_name: 'Henry', last_name: 'Grimp'}
	]
});

test.render('#greeting');

},{"../":1}]},{},[8])
;