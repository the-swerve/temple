var interpolation = require('./interpolation');

var conditional = function(node, props) {
	if (!(this instanceof conditional)) { return new conditional(node, props); }
	this.node = node
	this.full_prop = props;
	this.props = props.split('.');
}

conditional.prototype = new interpolation;

conditional.prototype.render = function(model) {
	this.subscribe(model);
	var val = utils.apply_array_of_props(model, this.props);
	this.node.style.display = val ? '' : 'none';
	return this;
};

module.exports = conditional;
