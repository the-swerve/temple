var Emitter = require('emitter')
var assert = require('assert')
var domify = require('domify')
var temple = require('temple')

describe('configs', function () {

	it('allows for a custom get function', function() {
		temple.config({
			get: function(model, prop) { return model.get(prop); }
		})
		var el = domify("<p tmpl-text='val'></p>")
		var model = function() {this['_val'] = 'hi'; return this;}
		model.prototype.get = function(val) { return this['_' + val]; }
		var data = new model()
		temple(data).render(el)
		assert.equal('hi', el.innerHTML)
		temple.config({
			get: function(model, prop) { return model[prop]; }
		})
	})

	it('allows for a custom subscribe function', function() {
		temple.config({
			subscribe: function(model, prop, render) {
				model.on('woot ' + prop, render)
			}
		})
		var el = domify("<p tmpl-text='val'></p>")
		var data = {val: 'oldval'}
		Emitter(data)
		temple(data).render(el)
		assert.equal('oldval', el.innerHTML)
		data.val = 'newval'
		data.emit('woot val')
		assert.equal('newval', el.innerHTML)
		temple.config({
			subscribe: function(model, prop, render) {
				model.on('change ' + prop, render)
			}
		})
	})

	it('gets nested properties with a custom get function', function() {
		temple.config({
			get: function(model, prop) {
				return model.get(prop)
			}
		})
		var el = domify("<p tmpl-text='y.x'></p>")
		var data = function(data) { this._data = data; }
		data.prototype.get = function(prop) { return this._data[prop]; }
		var x = new data({x: 'x'})
		var y = new data({y: x})
		temple(y).render(el)
		assert.equal(el.innerHTML, 'x')
		temple.config({
			get: function(model, prop) {
				return model[prop]
			}
		})
	})

	it('allows for a custom unsubscribe function', function() {
		temple.config({
			subscribe: function(model, prop, render) {
				model.on('woot ' + prop, render)
			},
			unsubscribe: function(model, prop, render) {
				model.off('woot ' + prop, render)
			}
		})
		var el = domify("<p tmpl-text='val'></p>")
		var data = {val: 'hi'}
		Emitter(data)
		var view = temple(data)
		view.render(el)
		assert.equal(view.model.listeners('woot val').length, 1)
		view.clear()
		assert.deepEqual(view.envs, [])
		assert.deepEqual(view.model.listeners('woot val'), [])
		temple.config({
			subscribe: function(model, prop, render) {
				model.on('change ' + prop, render)
			},
			unsubscribe: function(model, prop, render) {
				model.off('change ' + prop, render)
			}
		})
	})

	it('allows for a custom attr prefix', function() {
		temple.config({
			prefix: '--'
		})
		var el = domify("<p --text='val'></p>")
		var data = {val: 'hi'}
		var view = temple(data)
		view.render(el)
		assert.equal(el.innerHTML, data.val)
		temple.config({
			prefix: 'tmpl-'
		})
	})

})
