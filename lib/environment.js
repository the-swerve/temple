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
						this.interpolations.push(loop(current_node, attrs[i].value));
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
