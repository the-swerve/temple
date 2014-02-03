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
