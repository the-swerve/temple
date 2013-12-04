var config = module.exports = Object;

config.subscribe = function(model, property, render_function) {
	model.on('change ' + property, render_function);
};

config.unsubscribe = function(model, property, render_function) {
	model.off('change ' + property, render_function);
};

config.get = function(model, property) {
	return model[property];
};
