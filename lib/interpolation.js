/* 
 * An Interpolation is a template action in your HTML -- either a text
 * substitution (TextSub), attribute substitution (AttrSub), a loop (Loop), or
 * a conditional (Conditional)
 *
 * This is the parent prototype to the above things so would contain any common
 * functionality for them.
 */

var interpolation = function() {};

/* 
 * Subscribe to emitted events from the data model.
 * Default is 'change <property>'
 */
interpolation.prototype.subscribe = function(model) {
	if (!this.subscribed && model.on && model.on instanceof Function) {
		var self = this;
		model.on('change ' + this.full_prop, function() {
			self.render(model);
		});
		this.subscribed = true;
	}
	return this;
};

module.exports = interpolation;
