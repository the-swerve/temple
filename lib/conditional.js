/*
 * Conditionals do not evaluate any properties within their node unless the
 * conditional property is true. This allows the user to make references to
 * objects within objects that may or may not be defined without throwing
 * errors.
 *
 * Example: user comments
 * var el = domify('<p data-text='name'></p><p data-if='comment' data-text='comment.content'></p>')
 * var user = {name: 'bob'}
 * temple(user).render('p')
 *
 * In the above example, the second p node will not render and
 * data-text='comment.content' will not be evaluated, since user does not have
 * a comment.
 */ 

var Interpolation = require('./interpolation')
var utils = require('./utils')
var config = require('./config')

var Conditional = function(node, full_prop, nested, inverted) {
	this.node = node
	this.full_prop = full_prop
	this.props = full_prop.split('.')
	this.shown = false

	// Inverted denotes whether this is an inverse_conditional ('tmpl-unless')
	this.inverted = inverted

	// We save a reference to the parent and create a placeholder node so that we
	// can swap our conditional element in and out of the dom.
	this.parent_node = this.node.parentNode
	this.placeholder = document.createTextNode("")
	this.parent_node.replaceChild(this.placeholder, this.node)

	/* We have to do a dependency injection because there's circular dependence
	 * between Environment and Conditional. Environment needs to construct Conditionals when it
	 * traverses the DOM, and the Conditional needs to construct Environments for its
	 * child nodes.
	 */
	this.nested = nested
}

Conditional.prototype = new Interpolation()

Conditional.prototype.render = function(model) {
	var val = this.get_val(model)
	this.subscribe(model)
	var test = this.inverted ? !Boolean(val) : Boolean(val)
	if (test && !this.shown) {
		this.parent_node.replaceChild(this.node, this.placeholder)
		this.nested.render(model)
		this.shown = true
	} else if (this.shown && !test) {
		this.parent_node.replaceChild(this.placeholder, this.node)
		this.shown = false
	} else {
	}
	return this
}

Conditional.prototype.clear = function(model) {
	this.node.setAttribute(config.prefix + config.conditional, this.full_prop)
	this.unsubscribe(model)
	return this
}

module.exports = Conditional
