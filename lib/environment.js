/*
 * An Environment is an array of Interpolations.
 *
 * One Environment is created for each DOM node that our data is rendered into.
 */

var TextSub = require('./text_sub');
var AttrSub = require('./attr_sub');
var Loop = require('./loop');
var Conditional = require('./conditional');

var Environment = module.exports = function(parent_node) {
	var stack = [parent_node];
	this.interpolations = [];

	/* Recurse through the DOM tree, using a stack starting at the given node.
	 * Find any instances of 'dj-' prefixed attributes and create the matching
	 * Interpolation.
	 */
	while (stack.length > 0) {
		var current_node = stack.pop();
		var traverse_children = true; // flag whether to stop at the current node.
		var attrs = current_node.attributes;
		for (var i = 0; i < attrs.length; ++i) {
			if (attrs[i].name.indexOf('dj-') === 0) {
				if (attrs[i].name === 'dj-text') {
					this.interpolations.push(new TextSub(current_node, current_node.innerHTML));
					traverse_children = false;
				} else if (attrs[i].name === 'dj-loop') {
					this.interpolations.push(new Loop(current_node, attrs[i].value, Environment));
					traverse_children = false;
					break;
				} else if (attrs[i].name === 'dj-visible') {
					this.interpolations.push(new Conditional(current_node, attrs[i].value));
				} else if (attrs[i].name === 'dj-as') {
					// pass
				} else { // Attribute substitution
					this.interpolations.push(new AttrSub(current_node, attrs[i].value, attrs[i].name.replace('dj-', '')));
				}
			} // if
		} // for
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

Environment.prototype.render = function(model) {
	for (var i = 0; i < this.interpolations.length; ++i) {
		this.interpolations[i].render(model);
	}
	return this;
};
