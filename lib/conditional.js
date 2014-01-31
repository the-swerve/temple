var Interpolation = require('./interpolation');
var utils = require('./utils');

var Conditional = module.exports = function(node, full_prop) {
	this.node = node;
	this.full_prop = full_prop;
	this.props = full_prop.split('.');
};

Conditional.prototype = new Interpolation();

Conditional.prototype.render = function(model) {
	this.subscribe(model);
	var val = utils.apply_properties(model, this.props);
	this.node.style.display = val ? '' : 'none';
	return this;
};

Conditional.prototype.clear = function(model) {
	this.node.setAttribute('dj-visible', this.full_prop);
	this.node.style.display = '';
	this.unsubscribe(model);
	return this;
};
