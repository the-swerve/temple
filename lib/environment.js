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

// # Functional utilities

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
		ob.interps.push(create_cond(node, cond, config.prefix + config.conditional, false));
		return ob;
	}
	var unless = node.getAttribute(config.prefix + config.inverse_conditional);
	if (unless) {
		ob.interps.push(create_cond(node, unless, config.prefix + config.inverse_conditional, true));
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
var create_cond = function(node, attr_value, attr_name, inverted) {
	var prop = prepare_node(node, attr_value, attr_name);
	var env = new Environment(node);
	return new Conditional(node, prop, env, inverted);
};

// Create a new TextSub interpolation from a node with a 'text' attribute
var create_text_sub = function(node, attr_value) {
	var prop = prepare_node(node, attr_value, config.prefix + config.text);
	return new TextSub(node, prop);
};

// Create an AttrSub for anything that isn't the above
var create_attr_sub = function(node, attr_value, attr_name) {
	var prop = prepare_node(node, attr_value, attr_name);
	var name = attr_name.replace(config.prefix, ''); // remove the templating prefix
	return new AttrSub(node, prop, name);
};

// Remove the attr with attr_name from the node and return the property from
// attr_value with any whitespace removed 
var prepare_node = function(node, attr_value, attr_name) {
	node.removeAttribute(attr_name);
	return attr_value.replace(/\s+/g, '');
};
