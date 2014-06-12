var assert = require('assert')
var Obj = require ('../')

describe('obj', function() {

	it ('clones objects', function(){
		var Parent = Obj.clone()
		var Child = Parent.clone()
		for (var prop in Child) assert(Obj[prop] === Parent[prop] && Parent[prop] === Child[prop])
	})

	it ('mixes objects', function(){
		var Mixer = Obj.clone()
		Mixer.x = 'x'
		var Mixed = Obj.clone().mixin(Mixer)
		assert(Mixed.x === 'x')
	})

	it ('doesnt do weird stuff with setters', function() {
		var A = Obj.clone()
		A.method = function() {this.x = 99}
		var B = A.clone()
		B.method()
		var C = A.clone()
		var D = B.clone()
		assert(A.x === undefined)
		assert(B.x === 99);
		assert(C.x === undefined)
		assert(D.x === 99)
	})

	it ('runs the init function', function() {
		var A = Obj.clone()
		var called = false
		A.init = function(x) { this.x = x}
		var B = A.clone('hi')
		assert(B.x === 'hi')
	})

})
