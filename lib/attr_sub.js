
var attr_sub = function(node, props, attr) {
	if (!(this instanceof attr_sub)) { return new attr_sub(node, props, attr); }
	this.node = node;
	this.props = props.split('.');
	this.attr = attr;
}

attr_sub.prototype.render = function(data) {
	var val = utils.apply_array_of_props(data, this.props);
	if (this.attr === 'class') {
		if (this.node.className.indexOf(val) === -1) {
			if (this.node.className !== '') {
				this.node.className += ' ' + val;
			} else {
				this.node.className = val;
			}
		} // if
	} else {
		this.node.setAttribute(this.attr, val);
	}

	this.node.removeAttribute('deja-' + this.attr);
	return this;
};

module.exports = attr_sub;
