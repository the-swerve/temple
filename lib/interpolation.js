/* 
 * This is the parent prototype to text_sub, attr_sub, loop, and conditional
 */

var interpolation = function() { };

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
