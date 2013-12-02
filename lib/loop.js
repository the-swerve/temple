var interpolation = require('./interpolation');

var loop = function(node, props) {
	if (!(this instanceof loop)) { return new loop(node, props); }
	this.node = node;
	this.parent_node = node.parentNode;
	this.full_prop = props;
	this.props = props.split('.');
	this.each_name = node.getAttribute('deja-as') || 'this';
	this.subscribed = false;
	this.child_interps = [];
}

loop.prototype = new interpolation;

loop.prototype.render = function(model) {
	this.subscribe(model);
	this.node.removeAttribute('deja-loop');
	this.node.removeAttribute('deja-as');
	this.node.style.display = 'none';

	var arr = utils.apply_properties(model, this.props);
	if (!arr || !(arr instanceof Array)) return; // arrays only plez

	for (var i = 0; i < arr.length; ++i) {
		var existing = this.child_interps[i];
		var scoped = {};
		scoped[this.each_name] = arr[i];
		if (existing) {
			existing.env.render(scoped);
		} else {
			var new_node = this.node.cloneNode(true);
			new_node.style.display = '';
			var new_env = environment(new_node);
			this.parent_node.insertBefore(new_node, this.node);
			new_env.render(scoped);
			this.child_interps[i] = {node: new_node, env: new_env};
		}
	} // for

	// Remove extra nodes if the array was shortened
	if (this.child_interps.length > arr.length) {
		for (var i = this.child_interps.length - 1; i >= arr.length; --i) {
			this.parent_node.removeChild(this.child_interps[i].node);
			this.child_interps.splice(i, 1);
		}
	}

	return this;
};

module.exports = loop;
