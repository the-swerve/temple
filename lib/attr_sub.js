/* Insert data in the attribute of an element
 *
 * Example:
 * html: <p dj-id='property_name'></p>
 *
 * data: {property_name: 'bananas'}
 *
 * result: <p id='bananas'></p>
 */
var Interpolation = require('./interpolation');
var utils = require('./utils');

var AttrSub = module.exports = function(node, full_prop, attr) {
	this.node = node;
	this.full_prop = full_prop;
	this.props = full_prop.split('.');
	this.attr = attr;
	this.subscribed = false;
};

AttrSub.prototype = new Interpolation();

AttrSub.prototype.render = function(model) {
	this.subscribe(model);
	var val = utils.apply_properties(model, this.props);
	// If it's dj-class='property', then we'll want to append to that element's
	// classNames rather than overwriting them.
	if (this.attr === 'class') {
		if (this.node.className.indexOf(val) === -1) { // Element doesn't already have that class
			this.node.className = (this.node.className === '') ? val : this.node.className + ' ' + val;
		} // if
	} else { // Just write or overwrite that element's attribute
		this.node.setAttribute(this.attr, val);
	}
	this.node.removeAttribute('dj-' + this.attr);

	return this;
};

AttrSub.prototype.clear = function(model) {
	this.node.setAttribute('dj-' + this.attr, this.full_prop);
	this.unsubscribe(model);
	return this;
};
