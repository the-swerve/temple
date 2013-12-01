
var conditional = function() {
	if (!(this instanceof conditional)) { return new conditional(); }
}

conditional.prototype.render = function(data) {
	return this;
};

module.exports = conditional;
