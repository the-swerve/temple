var Emitter = require('emitter')
var assert = require('assert')
var domify = require('domify')
var temple = require('temple')

describe('text substitutions', function () {

	it('interpolates a basic value into a given node', function() {
		var el = domify("<p tmpl-text='val'>old</p>")
		var data = {val: 'hallo welt'}
		temple(data).render(el)
		assert(data.val == el.innerHTML)
	})

	it('renders to a list of nodes', function() {
		var el0 = domify("<p tmpl-text='val'>old</p>")
		var el1 = el0.cloneNode(true)
		var el2 = el0.cloneNode(true)
		var data = {val: 'hallo welt'}
		temple(data).render([el0, el1, el2])
		assert(data.val == el0.innerHTML)
	})

	it('accesses nested objects', function() {
		var el = domify("<p tmpl-text='obj.val.x.y'>old</p>")
		var data = {obj: {val: {x: {y: 'hallo welt'}}}}
		temple(data).render(el)
		assert(data.obj.val.x.y == el.innerHTML)
	})

	it ('ignores undefined nested objects', function() {
		var el = domify("<p tmpl-text='obj.val.x.y'>old</p>")
		var data = {}
		temple(data).render(el)
		assert(el.innerHTML === 'old')
	})

	it('updates automatically from changes', function() {
		var el = domify("<p tmpl-text='val'>old</p>")
		var data = {val: 'oldval'}
		Emitter(data)
		temple(data).render(el)
		assert.equal('oldval', el.innerHTML)
		data.val = 'newval'
		data.emit('change val')
		assert.equal('newval', el.innerHTML)
	})

	it('interpolates arrays', function() {
		var el = domify("<p tmpl-text='arr'>old</p>")
		var data = {arr: [1,2,3,4]}
		temple(data).render(el)
		assert('1,2,3,4' == el.innerHTML)
	})

	it('will not replace text when the value is undefined', function() {
		var el = domify("<p tmpl-text='wat'>old</p>")
		var data = {}
		temple(data).render(el)
		assert('old' == el.innerHTML)
	})

	it('clears out memory', function() {
		var el = domify("<p tmpl-text='val'>old</p>")
		var data = {val: 'hi'}
		Emitter(data)
		var view = temple(data)
		view.render(el)
		assert.equal(view.model.listeners('change val').length, 1)
		view.clear()
		assert.deepEqual(view.envs, [])
		assert.deepEqual(view.model.listeners('change val'), [])
	})

})
