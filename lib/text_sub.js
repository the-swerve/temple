/* Substitute the text node of an element with data.
 *
 * Example:
 * html: <p data-text>property_name</p>
 *
 * data: {property_name: 'bananas'}
 *
 * result: <p>bananas</p>
 */
var Interpolation = require('./interpolation')
var utils = require('./utils')
var config = require('./config')

var TextSub = function(node, props) {
	this.constructor(node, props)
	this.node = node
	this.full_prop = props
	this.props = props.split('.')
	this.subscribed = false
}

TextSub.prototype = new Interpolation()

TextSub.prototype.render = function(model) {
	var val = this.get_val(model)
	this.subscribe(model)
	if (val !== undefined) this.node.innerHTML = val
	return this
}

TextSub.prototype.clear = function(model) {
	this.node.setAttribute(config.prefix + config.text, this.full_prop)
	this.unsubscribe(model)
	return this
}

module.exports = TextSub
