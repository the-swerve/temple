var utils =  require('./lib/utils');
var Environment = require('./lib/environment');

var deja = module.exports = {};

thing = [1,2,3,4,5,6,7,7,8];

deja.view = function(model) {
	if (!(this instanceof deja.view)) { return new deja.view(model); }
	this.model = model;
	this.envs = [];
	this.before_render_callbacks = [];
	this.after_render_callbacks = [];
};

deja.view.prototype.render = function(el) {
	var nodes;
	if (typeof el === 'string') {
		nodes = document.querySelectorAll(el);
	} else if ((el instanceof NodeList) || (el instanceof Array)) {
		nodes = el;
	} else if (el instanceof Node) {
		nodes = [el];
	} else {
		throw TypeError("deja.view requires a query string, a NodeList, or a single Node");
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
