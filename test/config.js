var Emitter = require('emitter-component');
var assert = require('assert');
var domify = require('domify');
var temple = require('../');

suite('html');

describe('configs', function () {

	it('allows for a custom get function', function() {
		temple.config({
			get: function(model, prop) { return model.get(prop); }
		});
		var el = domify("<p data-text='val'></p>");
		var model = function() {this['_val'] = 'hi'; return this;};
		model.prototype.get = function(val) { return this['_' + val]; }
		var data = new model();
		temple(data).render(el);
		assert.equal('hi', el.innerHTML);
	});

	it('allows for a custom subscribe function', function() {
		temple.config({
			get: function(model, prop) { return model[prop]; },
			subscribe: function(model, prop, render) {
				model.on('woot ' + prop, render);
			}
		});
		var el = domify("<p data-text='val'></p>");
		var data = {val: 'oldval'};
		Emitter(data);
		temple(data).render(el);
		assert.equal('oldval', el.innerHTML);
		data.val = 'newval';
		data.emit('woot val');
		assert.equal('newval', el.innerHTML);
	});

	it('allows for a custom unsubscribe function', function() {
		temple.config({
			subscribe: function(model, prop, render) {
				model.on('woot ' + prop, render);
			},
			unsubscribe: function(model, prop, render) {
				model.off('woot ' + prop, render);
			}
		});
		var el = domify("<p data-text='val'></p>");
		var data = {val: 'hi'};
		Emitter(data);
		var view = temple(data);
		view.render(el);
		assert.equal(view.model.listeners('woot val').length, 1);
		view.clear();
		assert.deepEqual(view.envs, []);
		assert.deepEqual(view.model.listeners('woot val'), []);
	});

	it('allows for a custom attr prefix', function() {
		temple.config({
			prefix: '--'
		});
		var el = domify("<p --text='val'></p>");
		var data = {val: 'hi'};
		var view = temple(data);
		view.render(el);
		assert.equal(el.innerHTML, data.val);
	});

});
