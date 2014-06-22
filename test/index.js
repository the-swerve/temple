var assert = require('assert')
var Emitter = require('emitter-component')
var Domify = require('domify')
var Temple = require('../')

describe('Temple', function() {

	it('interpolates into text nodes', function() {
		var el = Domify("<p>{ val }</p>")
		var data = {val: 'hallo welt'}
		Temple.clone(data).render(el)
		assert.equal(data.val, el.innerHTML)
	})

	it('interpolates multiple vals', function() {
		var el = Domify("<p>{ val1 } { val2 }</p>")
		var data = {val1: 'hallo welt', val2: 'hello world'}
		Temple.clone(data).render(el)
		assert.equal(el.innerHTML, 'hallo welt hello world')
	})

	it('interpolates falsey vals', function() {
		var el = Domify("<p>{ val1 }{ val2 }</p>")
		var data = {val1: false, val2: 0}
		Temple.clone(data).render(el)
		assert.equal("false0", el.innerHTML)
	})

	it('doesnt mess up on regex character vals', function() {
		var el = Domify("<p>{ val }</p>")
		var data = {val: '$1'}
		Temple.clone(data).render(el)
		assert.equal(data.val, el.innerHTML)
	})

	it('interpolates nested values', function() {
		var el = Domify("<p>{a.b.c.d}</p>")
		var obj = {a: {b: {c: {d: 'hallo welt'}}}}
		Temple.clone(obj).render(el)
		assert(obj.a.b.c.d == el.innerHTML)
	})

	it ('undefined nested values interpolate as blank text', function() {
		var el = Domify("<p>{   obj.a.b.c   }</p>")
		var data = {}
		Temple.clone(data).render(el)
		assert(el.innerHTML === '')
	})

	it('interpolates into attributes', function() {
		var el = Domify("<p data-val='{  val  }'></p>")
		var data = {val: 'hallo welt'}
		Temple.clone(data).render(el)
		assert(data.val === el.getAttribute('data-val'))
	})

	it('interpolates into a list of class names', function() {
		var el = Domify("<p class='one {val}'></p>")
		var data = {val: 'two'}
		Temple.clone(data).render(el)
		assert(el.getAttribute('class') === 'one two')
	})

	it('updates the document automatically from changes', function() {
		var el = Domify("<p>{val}</p>")
		var data = {val: 'oldval'}
		Emitter(data)
		var template = Temple.clone(data).render(el)
		assert.equal('oldval', el.innerHTML)
		data.val = 'newval'
		data.emit('change val')
		assert.equal('newval', el.innerHTML)
	})

	it('clears out memory', function() {
		var el = Domify("<p>{val}</p>")
		var data = {val: 'hi'}
		Emitter(data)
		var view = Temple.clone(data)
		view.render(el)
		assert.equal(view.model.listeners('change val').length, 1)
		view.clear()
		assert.equal(view.model.listeners('change val').length, 0)
	})

	// Loops

	it('renders an array of values', function() {
		var el = Domify("<div><p each='arr'>{this}</p></div>")
		var arr = ['finn', 'jake']
		Temple.clone({arr: arr}).render(el)
		var children = el.childNodes
		assert.equal(children.length, arr.length)
		for(var i = 0; i < arr.length; ++i)
			assert.equal(children[i].innerHTML, arr[i])
	})

	it('renders an array of objects', function() {
		var el = Domify("<div><p each='buddies'>{name}</p></div>")
		var arr = [{name: 'Finn'}, {name: 'Jake'}]
		Temple.clone({buddies: arr}).render(el)
		var children = el.childNodes
		assert.equal(children.length, arr.length)
		for(var i = 0; i < arr.length; ++i)
			assert.equal(children[i].innerHTML, arr[i].name)
	})

	it("renders nested loops", function() {
		var el = Domify('<div><p each="arr"><span each="nested">{this}</span></p></div>')
		var arr = [{nested: [1, 2]}, {nested: [3, 4]}]
		var data = {arr: arr}
		Temple.clone(data).render(el)
		var children = el.childNodes
		assert.equal(children.length, arr.length)
		for(var i = 0; i < arr.length; ++i) {
			var spans = children[i].childNodes
			assert.equal(spans.length, arr[i].nested.length)
			for(var j = 0; j < arr[i].nested.length; ++j)
				assert.equal(spans[j].innerHTML, arr[i].nested[j])
		}
	})

	it("updates loops from events", function() {
		var el = Domify("<div><p each='arr'>{this}</p></div>")
		var data = {arr: ['finn', 'jake']}
		Emitter(data)
		Temple.clone(data).render(el)
		var children = el.childNodes
		assert.equal(children.length, data.arr.length)
		data.arr = ['finn', 'flame princess', 'ice king']
		data.emit('change arr')
		assert.equal(children.length, data.arr.length)
	})

	it ("renders an empty then longer array", function() {
		var el = Domify("<div><p each='arr'><span>{this}</span></p></div>")
		var arr = []
		var obj = {arr: []}
		Emitter(obj)
		Temple.clone(obj).render(el)
		assert.equal(el.childNodes.length, 0)
		obj.arr = ['finn', 'jake']
		obj.emit('change arr')
		assert.equal(el.childNodes.length, 2)
		for (var i = 0; i < obj.arr.length; ++i)
			assert.equal(el.childNodes[i].firstChild.innerHTML, obj.arr[i])
	})

	// Conditionals

	it('it doesnt interpolate with false conditions', function() {
		var el = Domify("<p>{hi ? whats up}</p>")
		Temple.clone({hi:false}).render(el)
		assert.equal(el.innerHTML, '')
	})

	it('it interpolates with true conditions', function() {
		var el = Domify("<p>{hi ? whats up}</p>")
		Temple.clone({hi:true}).render(el)
		assert.equal(el.innerHTML, 'whats up')
	})

	// Config

	it('gets nested properties with a custom get function', function() {
		var template = Temple.clone()
		template.get = function(model, prop) { return model.get(prop) }
		var el = Domify("<p>{y.x}</p>")
		var data = function(data) { this._data = data }
		data.prototype.get = function(prop) { return this._data[prop] }
		var x = new data({x: 'x'})
		var y = new data({y: x})
		template.set(y).render(el)
		assert.equal(el.innerHTML, 'x')
	})

	it('allows for a custom subscribe/unsubscribe function', function() {
		var template = Temple.clone()
		template.subscribe = function(model, prop, render) {
			model.on('woot ' + prop, render)
		}
		template.unsubscribe = function(model) {
			model.off('woot val')
		}
		var el = Domify("<p>{val}</p>")
		var data = {val: 'oldval'}
		Emitter(data)
		template.set(data).render(el)
		assert.equal('oldval', el.innerHTML)
		data.val = 'newval'
		data.emit('woot val')
		assert.equal('newval', el.innerHTML)
		template.clear()
		assert(!template.model.hasListeners('woot val'))
	})

})
