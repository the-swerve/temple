/* Substitute the text node of an element with data.
 *
 * Example:
 * html: <p deja-text>property_name</p>
 *
 * data: {property_name: 'bananas'}
 *
 * result: <p>bananas</p>
 */
var interpolation = require('./interpolation');

var text_sub = function(node, props) {
	if (!(this instanceof text_sub)) { return new text_sub(node, props); }
	this.constructor(node, props);
	this.node = node;
	this.full_prop = props;
	this.props = props.split('.');
	this.subscribed = false;
}

text_sub.prototype = new interpolation();

text_sub.prototype.render = function(model) {
	this.subscribe(model);
	var val = utils.apply_properties(model, this.props) || '';
	this.node.innerHTML = val;
	this.node.removeAttribute('deja-text');
	return this;
};

module.exports = text_sub;
