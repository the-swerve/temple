var utils = module.exports = {};

utils.nodelist_to_array = function(nodes) {
	var arr = [];
	for(var i = 0, n; n = nodes[i]; ++i) arr.push(n);
};

utils.apply_properties = function(obj, props) {
	if (props.length > 0) {
		var val = obj[props[0]];
	} else {
		return obj;
	}
	for (var i = 1; i < props.length; ++i) {
		val = val[props[i]];
	}
	return val;
};
