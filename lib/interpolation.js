/* 
 * An Interpolation is a template action in your HTML -- either a text
 * substitution (TextSub), attribute substitution (AttrSub), a loop (Loop), or
 * a conditional (Conditional)
 *
 * This is the parent prototype to the above things so would contain any common
 * functionality for them.
 */

var config = require('./config');

var interpolation = module.exports = function() {};

/* 
 * Subscribe to emitted events from the data model.
 * Default is 'change <property>'
 */
interpolation.prototype.subscribe = function(model) {
	if (!this.subscribed && model.on && model.on instanceof Function) {
		var self = this;
		this.change_fn = function() { self.render(model); };
		config.subscribe(model, this.full_prop, this.change_fn);
		this.subscribed = true;
	}
	return this;
};

interpolation.prototype.unsubscribe = function(model) {
	if (this.subscribed && model.off && model.off instanceof Function) {
		config.unsubscribe(model, this.full_prop, this.change_fn);
		this.subscribed = false;
	}
	return this;
};
