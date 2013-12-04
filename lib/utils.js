var config = require ('./config');
var utils = module.exports = {};

utils.apply_properties = function(obj, props) {
	var val = obj;
	for (var i = 0; i < props.length; ++i) {
		val = config.get(val, props[i]);
	}
	return val;
};
