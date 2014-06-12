if (typeof Object.create !== 'function') {
	(function() {
		var F = function() {}
		Object.create = function(o) {
			if(arguments.length > 1 && arguments[1] !== undefined)
				throw Error('Second argument not supported')
			if(o === null)
				throw Error('Cannot set a null [[Prototype]]')
			if(typeof o != 'object')
				throw TypeError('Argument must be an object')
			F.prototype = o
			return new F()
		}
	})()
}

var Obj = {
	clone: function() {
		var obj = Object.create(this)
		obj.init.apply(obj, arguments)
		return obj
	},
	init: function() {},
	mixin: function(obj) {
		for (var key in obj) this[key] = obj[key]
		return this
	}
}

module.exports = Obj
