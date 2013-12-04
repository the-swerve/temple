var utils =  require('./lib/utils');
var Environment = require('./lib/environment');

var deja = module.exports = {};

deja.view = function(model) {
	if (!(this instanceof deja.view)) { return new deja.view(model); }
	this.model = model;
	this.envs = [];
	this.before_render_callbacks = [];
	this.after_render_callbacks = [];
};

deja.view.prototype.render = function(el) {
	if (el instanceof String) {
		var nodes = document.querySelectorAll(query_string);
	} else if (el instanceof NodeList) {
		var nodes = el;
	} else if (el instanceof Node) {
		var nodes = [el];
	} else {
		throw "Requires a query string, a NodeList, or a single Node";
	}

	this.envs = [];
	for (var i = 0; i < nodes.length; ++i) {
		var env = new Environment(nodes[i]);
		this.envs.push(env);
		env.render(this.model);
	}
	return this;
};

deja.view.prototype.before_render = function(callback) {
	// TODO
};

deja.view.prototype.after_render = function(callback) {
	// TODO
};

deja.config = function(settings) {
	//TODO
};
