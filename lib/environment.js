/*
 * An Environment is an array of Interpolations.
 *
 * One Environment is created for each DOM node that our data is rendered into.
 */

var TextSub = require('./text_sub');
var AttrSub = require('./attr_sub');
var Loop = require('./loop');
var Conditional = require('./conditional');
var config = require('./config');

var Environment = module.exports = function(parent_node) {
	var stack = [parent_node];
	var prefix = config.prefix;
	this.interpolations = [];

	/* Recurse through the DOM tree, using a stack starting at the given node.
	 * Find any instances of prefixed attributes and create the matching
	 * Interpolation.
	 */
	while (stack.length > 0) {
		var current_node = stack.pop();
		var traverse_children = true; // flag whether to stop at the current node.
		var attrs = current_node.attributes || [];
		for (var i = 0; i < attrs.length; ++i) {
			var attr = attrs[i];
			var name = attr.name.replace(/\s+/g, '');
			if (name.indexOf(prefix) === 0) {
				if (name === (prefix + 'text')) {
					this.interpolations.push(new TextSub(current_node, attr.value));
					traverse_children = false;
				} else if (name === (prefix + 'each')) {
					this.interpolations.push(new Loop(current_node, attr.value, Environment));
					traverse_children = false;
					break; // XXX
				} else if (name === (prefix + 'visible')) {
					this.interpolations.push(new Conditional(current_node, attr.value));
				} else { // Attribute substitution
					this.interpolations.push(new AttrSub(current_node, attr.value, name.replace(prefix, '')));
				}
			} // if
		} // for
		if (traverse_children) {
			var children = current_node.childNodes;
			if (children) {
				for (var j = 0; j < children.length; ++j) {
					stack.push(children[j]);
				}
			}
		}
	} // while

	return this;
};

Environment.prototype.render = function(model) {
	for (var i = 0; i < this.interpolations.length; ++i) {
		this.interpolations[i].render(model);
	}
	return this;
};

Environment.prototype.clear = function(model) {
	for (var i = 0; i < this.interpolations.length; ++i) {
		this.interpolations[i].clear(model);
	}
	return this;
};
