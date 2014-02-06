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

config.len = function(collection) {
	return collection.length;
}

config.index = function(collection, i) {
	return collection[i];
}

config.conditional = 'if'; // conditional attribute postfix keyword

config.loop = 'each'; // loop attribute postfix keyword

config.text = 'text'; // text attribute postfix keyword

config.prefix = 'data-'; // attribute prefix keyword
