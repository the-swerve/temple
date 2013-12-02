/* Insert data in the attribute of an element
 *
 * Example:
 * html: <p deja-id='property_name'></p>
 *
 * data: {property_name: 'bananas'}
 *
 * result: <p id='bananas'></p>
 */
var interpolation = require('./interpolation');

var attr_sub = function(node, props, attr) {
	if (!(this instanceof attr_sub)) { return new attr_sub(node, props, attr); }
	this.node = node;
	this.full_prop = props;
	this.props = props.split('.');
	this.attr = attr;
	this.subscribed = false;
}

attr_sub.prototype = new interpolation;

attr_sub.prototype.render = function(model) {
	if (!this.subscribed && model.on && model.on instanceof Function) {
		this.subscribe(model);
	}
	var val = utils.apply_properties(model, this.props);
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
