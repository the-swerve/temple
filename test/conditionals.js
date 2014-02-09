var Emitter = require('emitter')
var assert = require('assert')
var domify = require('domify')
var temple = require('temple')

describe('conditionals', function () {

	it("remove the node if the value is false", function() {
		var el = domify("<div><p tmpl-if='cond'></p></div>")
		var data = {cond: false}
		temple(data).render(el)
		assert.equal(el.innerHTML, '')
	})

	it("show the node if the value is true", function() {
		var el = domify("<div><p tmpl-if='cond'></p></div>")
		var data = {cond: true}
		temple(data).render(el)
		assert.equal(el.childNodes.length, 1)
	})

	it("show data within the node if the value is true", function() {
		var el = domify("<div><p tmpl-if='cond' tmpl-text='x'></p></div>")
		var data = {cond: true, x: 'x'}
		temple(data).render(el)
		assert.equal(el.firstChild.innerHTML, 'x')
	})

	it("remove the node unless the value is false", function() {
		var el = domify("<div><p tmpl-unless='cond'></p></div>")
		var data = {cond: true}
		temple(data).render(el)
		assert.equal(el.innerHTML, '')
	})

	it("show the node unless the value is true", function() {
		var el = domify("<div><p tmpl-unless='cond'></p></div>")
		var data = {cond: false}
		temple(data).render(el)
		assert.equal(el.childNodes.length, 1)
	})

	it("do not compute other attributes on the elem if false", function() {
		var el = domify("<div><p tmpl-if='cond' tmpl-href='x.y.z'></p></div>")
		var data = {cond: false}
		temple(data).render(el)
		assert.equal(el.innerHTML, '')
	})

	it("do not compute text on the elem if false", function() {
		var el = domify("<div><p tmpl-if='cond' tmpl-text='x.y.z'></p></div>")
		var data = {cond: false}
		temple(data).render(el)
		assert.equal(el.innerHTML, '')
	})

	it("do not compute nested attributes on the elem if false", function() {
		var el = domify("<div><p tmpl-if='cond'><span tmpl-text='nonexistent_property'></span></p></div>")
		var data = {cond: false}
		temple(data).render(el)
		assert.equal(el.innerHTML, '')
	})

	it("update on events", function() {
		var inner = domify('<p tmpl-if="cond"></p>')
		var el = domify("<div></div>")
		el.appendChild(inner)
		var data = {cond: false}
		Emitter(data)
		temple(data).render(el)
		assert.equal(el.innerHTML, '')
		assert.strictEqual(el.innerHTML, '', 'should be hidden when false')
		data.cond = true
		data.emit('change cond')
		assert.strictEqual(el.firstChild, inner, 'should be shown when true')
	})

	it("works on true-ish and false-ish value", function() {
		var inner = domify('<p tmpl-if="cond"></p>')
		var el = domify("<div></div>")
		el.appendChild(inner)
		// Falsishes
		var data = {cond: 0}
		Emitter(data)
		temple(data).render(el)
		assert.strictEqual(el.innerHTML, '', '0 should hide')
		data.cond = ''
		data.emit('change cond')
		assert.strictEqual(el.innerHTML, '', 'empty str should hide')
		data.cond = null
		data.emit('change cond')
		assert.strictEqual(el.innerHTML, '', 'null should hide')
		data.cond = undefined
		data.emit('change cond')
		assert.strictEqual(el.innerHTML, '', 'undef should hide')
		// Trueishes
		data.cond = 1
		data.emit('change cond')
		assert.strictEqual(el.firstChild, inner, '1 should show')
		data.cond = 'hi'
		data.emit('change cond')
		assert.strictEqual(el.firstChild, inner, 'non-empty str should show')
		data.cond = []
		data.emit('change cond')
		assert.strictEqual(el.firstChild, inner, 'arr should show')
	})

	it('clears out memory', function() {
		var el = domify("<div><p tmpl-if='cond'></p></div>")
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
