
/**
 * Interpolation illumination implementation incantation imputation infatuation 
 */

/*
 * Environment:
 * A list of substitutions, conditions, and loops
 *
 * Substitutions:
 * A mapping of properties to dom nodes.
 *
 * Conditions and loops:
 * A mapping of properties to dom nodes and all their child nodes
 *
 * Initializing the environment:
 * Go through and identify where the properties appear in the dom.
 * If it's in braces, it's a substitution, so save that node as a substitution in the environment.
 * If it's in the 'each' attribute, save it as a loop, save the child nodes, then store the 'as' attribute name.
 * If it's in the 'if' attribute, save it as a condition and save the child nodes
 */

var iterate = require('iterate-function');

re = /(\{[^}]+\})/g; // TODO make this customizable.

var deja = Object;

deja.view = function(selector, data) {
	if (!(this instanceof deja.view)) return new deja.view();
	this.data = data;
	this.nodes = document.querySelectorAll(selector);
	// The environment is an object that describes the state of your view.
	this.environment = interpolate.initialize_template(nodes);
};

module.exports = deja;

/*
 * interpolate is the (semi) stateless module that does all the functional work.
 */

interpolate = Object;

/*
 * Initialize our environment of substitutions, conditionals, and loops.
 */

interpolate.initialize_template = function(nodes) {
	var stack = nodes;
	var environment = [];

	while (stack.length > 0) {
		var current_node = stack.pop();
		var children = current_node.childNodes;
		if (children) {
			find_properties_in_children(children, environment, stack);
		}
	}

	return environment;
};

/*
 * Re-render only the elements of the template where certain properties have
 * changed.
 *
 * Re-evaluate properties that are functions which access properties that have changed.
 */

interpolate.render = function(environment, data, props_changed) {
	var self = this;

	var render_each = function(mapping) {
		if (!props_changed || intersection(mapping.props, props_changed)) {
			if (mapping.type === 'loop') {
				interpolate.perform_loop(mapping, data);
			} else if (mapping.type === 'conditional') {
				interpolate.perform_conditional(mapping, data);
			} else {
				interpolate.perform_substitution(mapping, data);
			}
		}
	};

	environment.map(render_each);
};

/*
 * Find the substitutions, loops, and conditionals in a DOM tree
 */

var find_properties_in_children = function(children, environment, stack) {
	children.map(function(child) {
		if (child.nodeType === 3) { // TextNode
			insert_substitution(child, environment);
		} else {
			attrs = child.attributes;
			find_attribute_properties(child, environment);
			stack.push(child);
		}
	});
};

var find_attribute_properties = function(child, environment) {
	child.attributes.map(function(attr) {
		if (attr.name === 'each') {
			insert_loop(child, attr, environment);
		} else {
			insert_substitution(attr, environment);
		}
	});
};

/*
 * Parse a loop from the template using the "each" attribute and create an
 * environment for the loop, which contains all the things necessary to execute
 * that loop (see 'perform_loop').
 */

var insert_loop = function(node, attr, environment) {
	var re = /(\w+) in (\w+)/;
	// parse "each='x in y'" and get x and y
	var matches = attr.value.match(re);
	if (matches.length === 3) {
		var elem = matches[1];
		var list = matches[2];
		var template = node.cloneNode(true);
		template.removeAttribute('each');
		environment.push({
			type: 'loop',
			props: [list],
			parent_node: node.parentNode,
			list: list,
			elem: elem,
			template: template,
			children: []
		});
		node.parentNode.removeChild(node); // remove the initial loop template
	}
};

/*
 * Create an environment of the properties to be substituted with the references to
 * their DOM nodes.
 */

var insert_substitution = function(node, environment) {
	var text = node.nodeValue;
	var matches = text.match(re);

	if (matches) {
		props = matches.map(function (m) {
			var prop = strip_prop(m);
			var pieces = prop.split('.');
			return pieces[0];
		});
		environment.push({props: props, orig: text, node: node});
	}
};

/*
 * Substitute a property in the template with its value.
 */

interpolate.perform_substitution = function(mapping, data) {
	mapping.node.nodeValue = mapping.orig.replace(re, function(match) {
		var props = strip_prop(match).split('.');
		// object attribute reference with potentially infinite nesting.
		return iterate(props.length, data, function(val, i) {
			return val[props[i]];
		});
	});
};

/*
 * Show or hide a section of the dom based on a boolean.
 */

interpolate.perform_conditional = function(mapping, data) {
}

/*
 * Execute a loop in the template.
 */

interpolate.perform_loop = function(loop_mapping, data) {
	var list = data[loop_mapping.list];
	if (!list) return; // leave blank if the list is not present in the data
	var diff = loop_mapping.children.length - list.length;

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
};

/*
 * Strip out the whitespace and braces from a template property
 * TODO
 * make the strip regex derived from 're'
 */

strip_prop = function(prop) {
	return prop.replace(/[ \{\}]+/g, '');
};

/*
 * Find the intersection of two lists.
 * TODO use a module for this.
 */

intersection = function(xs, ys) {
	for (var i = 0; i < xs.length; i++) {
		if (ys.indexOf(xs[i]) != -1) return true;
	} return false;
};
