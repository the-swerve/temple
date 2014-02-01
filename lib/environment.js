/*
 * An Environment is an array of Interpolations.
 *
 * One Environment is created for each DOM node that our data is rendered into.
 */

var TextSub = require('./text_sub');
var AttrSub = require('./attr_sub');
var Loop = require('./loop');
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
		// Ignore all non-element nodes
		if ([2, 3, 4, 5, 6, 7, 8, 9, 10, 11].indexOf(current_node.nodeType) === -1) {
			// First check for a loop, which takes precedence and scopes everything else within it.
			var loop = current_node.getAttribute(prefix + 'each');
			if (loop) {
				current_node.removeAttribute(prefix + 'each');
				this.interpolations.push(new Loop(current_node, loop, Environment));
				traverse_children = false;
			} else {
				var text = current_node.getAttribute(prefix + 'text');
				if (text) {
					current_node.removeAttribute(prefix + 'text');
					this.interpolations.push(new TextSub(current_node, text.replace(/\s+/g,'')));
					traverse_children = false;
				}
				// Find all other deja attributes that aren't texts/loops
				var attrs = current_node.attributes;
				for (var i = 0; i < attrs.length; ++i) {
					if (attrs[i].name.indexOf(prefix) === 0) {
						var attr_name = attrs[i].name.replace(prefix, '');
						this.interpolations.push(new AttrSub(current_node, attrs[i].value, attr_name));
					}
				}
			}
		}

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

var parse_attrs = function(node, interps) {
};

Environment.prototype.render = function(data) {
	for (var i = 0; i < this.interpolations.length; ++i) {
		this.interpolations[i].render(data);
	}
	return this;
};

Environment.prototype.clear = function(model) {
	for (var i = 0; i < this.interpolations.length; ++i) {
		this.interpolations[i].clear(model);
	}
	return this;
};
