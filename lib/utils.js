var utils = module.exports = {};

utils.nodelist_to_array = function(nodes) {
	var arr = [];
	for(var i = 0; i < nodes.length; ++i) {
		arr.push(nodes[i]);
	}
};

utils.apply_properties = function(obj, props) {
	var val = obj;
	for (var i = 0; i < props.length; ++i) {
		val = val[props[i]];
	}
	return val;
};
