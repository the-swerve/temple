var utils =  require('./lib/utils.js');
environment = require('./lib/environment.js');

deja = Object;

deja.view = function(model) {
	if (!(this instanceof deja.view)) { return new deja.view(model); }
	this.model = model;
};

deja.view.prototype.render = function(el) {
	if (el instanceof String) {
		var nodes = document.querySelectorAll(query_string);
	} else {
		var nodes = [el];
	}

	this.envs = this.envs || [];
	for (var i = 0; i < nodes.length; ++i) {
		var env = environment(nodes[i]);
		this.envs.push(env);
		env.render(this.model);
	}
	return this;
};

module.exports = deja;
