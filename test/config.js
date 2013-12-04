var Emitter = require('emitter-component');
var assert = require('assert');
var domify = require('domify');
var deja = require('../');

suite('html');

describe('configs', function () {

	it('allows for a custom get function', function() {
		deja.config({
			get: function(model, prop) { return model.get(prop); }
		});
		var el = domify("<p dj-text>val</p>");
		var model = function() {this['_val'] = 'hi'; return this;};
		model.prototype.get = function(val) { return this['_' + val]; }
		var data = new model();
		deja.view(data).render(el);
		assert.equal('hi', el.innerHTML);
	});

	it('allows for a custom subscribe function', function() {
		deja.config({
			get: function(model, prop) { return model[prop]; },
			subscribe: function(model, prop, render) {
				model.on('woot ' + prop, render);
			}
		});
		var el = domify("<p dj-text>val</p>");
		var data = {val: 'oldval'};
		Emitter(data);
		deja.view(data).render(el);
		assert.equal('oldval', el.innerHTML);
		data.val = 'newval';
		data.emit('woot val');
		assert.equal('newval', el.innerHTML);
	});

	it('allows for a custom unsubscribe function', function() {
		deja.config({
			subscribe: function(model, prop, render) {
				model.on('woot ' + prop, render);
			},
			unsubscribe: function(model, prop, render) {
				model.off('woot ' + prop, render);
			}
		});
		var el = domify("<p dj-text>val</p>");
		var data = {val: 'hi'};
		Emitter(data);
		var view = deja.view(data);
		view.render(el);
		assert.equal(view.model.listeners('woot val').length, 1);
		view.unrender();
		assert.deepEqual(view.envs, []);
		assert.deepEqual(view.model.listeners('woot val'), []);
	});

});
