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

var Loop = module.exports = function(node, props, env_constructor) {
	this.node = node;
	this.parent_node = node.parentNode;
	this.full_prop = props;
	this.props = props.split('.');
	this.each_name = node.getAttribute('dj-as') || 'this';
	this.subscribed = false;
	this.child_interps = [];

	/* We have to do a dependency injection because there's circular dependence
	 * between Environment and Loop. Environment needs to construct Loops when it
	 * traverses the Dom, and the Loop needs to construct Environments for its
	 * child nodes.
	 */
	this.Environment = env_constructor;
};

Loop.prototype = new Interpolation();

Loop.prototype.render = function(model) {
	this.subscribe(model);
	this.node.removeAttribute('dj-loop');
	this.node.removeAttribute('dj-as');
	this.node.style.display = 'none';

	var arr = utils.apply_properties(model, this.props);
	if (!arr || !(arr instanceof Array)) return; // arrays only plez

	// Sync all the data with the existing nodes.
	// TODO -- what if the array is resorted? Then we'd ideally want the DOM
	// nodes to be resorted to reflect the new order rather than changing the
	// data in the existing DOM node order.
	// eg: <i data-checked>1</i>, <i>2</i>, <i>3</i>
	// user reverses array, and we should get:
	// eg: <i>3</i>, <i>2</i>, <i data-checked>1</i>
	// instead, the current version gives us:
	// eg: <i data-checked>3</i>, <i>2</i>, <i>1</i>
	// as you can see, the dynamic state 'data-checked' is moved to the node with
	// '3' on data update when it was meant for '1'.
	for (var i = 0; i < arr.length; ++i) {
		var existing = this.child_interps[i];
		var scoped = {};
		scoped[this.each_name] = arr[i];
		if (existing) {
			existing.env.render(scoped);
		} else {
			var new_node = this.node.cloneNode(true);
			new_node.style.display = '';
			var new_env = new this.Environment(new_node);
			this.parent_node.insertBefore(new_node, this.node);
			new_env.render(scoped);
			this.child_interps[i] = {node: new_node, env: new_env};
		}
	}

	// Remove any extra nodes.
	if (this.child_interps.length > arr.length) {
		for (var j = this.child_interps.length - 1; j >= arr.length; --j) {
			this.parent_node.removeChild(this.child_interps[j].node);
			this.child_interps.splice(j, 1);
		}
	}

	return this;
};

Loop.prototype.unrender = function(model) {
	this.node.setAttribute('dj-loop', this.full_prop);
	if (this.each_name != 'this') {
		this.node.setAttribute('dj-as', this.each_name);
	}
	for (var k = 0; k < this.child_interps.length; ++k) {
		this.parent_node.removeChild(this.child_interps[k].node);
	}
	this.unsubscribe(model);
	return this;
};
