var utils =  require('./lib/utils');
var Environment = require('./lib/environment');

var deja = module.exports = {};

deja.view = function(model) {
	if (!(this instanceof deja.view)) { return new deja.view(model); }
	this.model = model;
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

deja.config = function(settings) {
};
