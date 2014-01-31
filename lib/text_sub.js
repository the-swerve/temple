/* Substitute the text node of an element with data.
 *
 * Example:
 * html: <p dj-text>property_name</p>
 *
 * data: {property_name: 'bananas'}
 *
 * result: <p>bananas</p>
 */
var Interpolation = require('./interpolation');
var utils = require('./utils');
var config = require('./config');

var TextSub = module.exports = function(node, props) {
	this.constructor(node, props);
	this.node = node;
	this.full_prop = props;
	this.props = props.split('.');
	this.subscribed = false;
};

TextSub.prototype = new Interpolation();

TextSub.prototype.render = function(model) {
	this.subscribe(model);
	var val = utils.apply_properties(model, this.props);
	if (val) {
		this.node.innerHTML = val;
		this.node.removeAttribute(config.prefix + 'text');
	}
	return this;
};

TextSub.prototype.clear = function(model) {
	this.node.setAttribute(config.prefix + 'text');
	this.node.innerHTML = this.full_prop;
	this.unsubscribe(model);
	return this;
};
