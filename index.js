var utils =  require('./lib/utils')
var config = require('./lib/config')
var Environment = require('./lib/environment')

temple = function(model) {
	if (!(this instanceof temple)) { return new temple(model); }
	this.model = model
	this.envs = []
	this.before_render_callbacks = []
	this.after_render_callbacks = []
}

temple.prototype.render = function(el) {
	var nodes = []
	if (el.length > 0) {
		nodes = el
	} else if (el.nodeType > 0) { //IE<9 has no Node
		nodes = [el]
	} else {
		throw TypeError("temple requires a Node, array of Nodes, or a NodeList")
	}

	this.envs = []
	for (var i = 0; i < nodes.length; ++i) {
		var env = new Environment(nodes[i])
		this.envs.push(env)
		env.render(this.model)
	}
	return this
}

temple.prototype.clear = function() {
	for (var i = 0; i < this.envs.length; ++i) {
		this.envs[i].clear(this.model)
	}
	this.envs = []
	return this
}

temple.config = function(options) {
	for (var attr in options) {
		config[attr] = options[attr]
	}
}

module.exports = temple
