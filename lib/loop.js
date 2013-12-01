
var loop = function(node, props, each_name) {
	if (!(this instanceof loop)) { return new loop(node, props, each_name); }
	this.node = node;
	this.parent_node = node.parentNode;
	this.props = props.split('.');
	this.each_name = each_name;
	
	// Construct the environment for the all the children of this list
	node.removeAttribute('deja-loop');
	this.parent_node.removeChild(node);

	this.child_interps = [];
}

loop.prototype.render = function(data) {
	var arr = utils.apply_array_of_props(data, this.props);
	if (!arr || !(arr instanceof Array)) return; // arrays only plez

	for (var i = 0; i < arr.length; ++i) {
		var existing = this.child_interps[i];
		if (existing) {
			// todo
		} else {
			var new_node = this.node.cloneNode(true);
			var new_env = environment(new_node);
			console.log('new_env', new_env);
			this.parent_node.appendChild(new_node);
			this.child_interps[i] = [new_node, new_env];
			var scoped = {};
			scoped[this.each_name] = arr[i];
			console.log(scoped);
			new_env.render(scoped);
		}
	}

	/* 

	// Truncate our nodes if the list has been shortened.
	iterate(diff, null, function() {
		var last_child = loop_mapping.parent_node.lastChild;
		loop_mapping.parent_node.removeChild(last_child);
		loop_mapping.children.pop();
	});

	// Expand the number of repeated nodes if our list has been lengthened.
	iterate(-diff, null, function() {
		var clone = loop_mapping.template.cloneNode(true);
		loop_mapping.parent_node.appendChild(clone);
		var nested_environment = interpolate.initialize_template(clone);
		loop_mapping.children.push(nested_environment);
	});

	// Sync the data in the list with the properties in the dom.
	mff.map(list, function(elem, i) {
		var scoped_data = {};
		scoped_data[loop_mapping.elem] = elem;
		if (loop_mapping.children[i]) {
			// A node in the dom for this element exists; sync the data.
			interpolate.render(loop_mapping.children[i], scoped_data);
		} else {
			// Add a new node in the dom for this element.
			interpolate.render(nested_environment, scoped_data);
		}
	});
	*/
	return this;
};

module.exports = loop;
