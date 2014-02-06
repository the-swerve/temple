var Emitter = require('emitter-component')
var assert = require('assert')
var domify = require('domify')
var temple = require('../')

suite('html')

describe('conditionals', function () {

	it("remove the node if the value is false", function() {
		var el = domify("<div><p data-if='cond'></p></div>")
		var data = {cond: false}
		temple(data).render(el)
		assert.equal(el.innerHTML, '')
	})

	it("show the node if the value is true", function() {
		var el = domify("<div><p data-if='cond'></p></div>")
		var data = {cond: true}
		temple(data).render(el)
		assert.equal(el.childNodes.length, 1)
	})

	it("do not compute other attributes on the elem if false", function() {
		var el = domify("<div><p data-if='cond' data-text='nonexistent_property'></p></div>")
		var data = {cond: false}
		temple(data).render(el)
		assert.equal(el.innerHTML, '')
	})

	it("do not compute nested attributes on the elem if false", function() {
		var el = domify("<div><p data-if='cond'><span data-text='nonexistent_property'></span></p></div>")
		var data = {cond: false}
		temple(data).render(el)
		assert.equal(el.innerHTML, '')
	})

	it("update on events", function() {
		var inner = domify('<p data-if="cond"></p>')
		var el = domify("<div></div>")
		el.appendChild(inner)
		var data = {cond: false}
		Emitter(data)
		temple(data).render(el)
		assert.equal(el.innerHTML, '')
		data.cond = true
		data.emit('change cond')
		assert.equal(el.firstChild, inner)
	})

	it("works on true-ish and false-ish value", function() {
		var inner = domify('<p data-if="cond"></p>')
		var el = domify("<div></div>")
		el.appendChild(inner)
		var data = {cond: 0}
		Emitter(data)
		temple(data).render(el)
		assert.equal(el.innerHTML, '')
		data.cond = 1
		data.emit('change cond')
		assert.equal(el.firstChild, inner)
		data.cond = 'false'
		data.emit('change cond')
		assert.equal(el.innerHTML, '')
		data.cond = ''
		data.emit('change cond')
		assert.equal(el.innerHTML, '')
	})

	it('clears out memory', function() {
		var el = domify("<div><p data-if='cond'></p></div>")
		var data = {cond: true}
		Emitter(data)
		var view = temple(data)
		view.render(el)
		assert.equal(view.model.listeners('change cond').length, 1)
		view.clear()
		assert.deepEqual(view.envs, [])
		assert.deepEqual(view.model.listeners('change cond'), [])
	})


})
