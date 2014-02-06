var config = {
	conditional: 'if',
	loop: 'each',
	text: 'text',
	prefix: 'data-'
}

config.subscribe = function(model, property, render_function) {
	model.on('change ' + property, render_function)
}

config.unsubscribe = function(model, property, render_function) {
	model.off('change ' + property, render_function)
}

config.get = function(model, property) {
	return model[property]
}

config.len = function(collection) {
	return collection.length
}

config.index = function(collection, i) {
	return collection[i]
}

module.exports = config
