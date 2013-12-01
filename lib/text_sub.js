
var text_sub = function(node, props) {
	if (!(this instanceof text_sub)) { return new text_sub(node, props); }
	this.props = props.split('.');
	this.node = node;
}

text_sub.prototype.render = function(data) {
	var val = utils.apply_array_of_props(data, this.props);
	this.node.innerHTML = val;
	this.node.removeAttribute('deja-text');
	return this;
};

module.exports = text_sub;
