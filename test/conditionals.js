var Emitter = require('emitter-component');
var assert = require('assert');
var domify = require('domify');
var deja = require('../');

suite('html');

describe('conditionals', function () {

	it("sets the element to display:'' if the value is true", function() {
		var el = domify("<p dj-visible='cond'></p>");
		el.style.display = 'none';
		var data = {cond: true};
		deja.view(data).render(el);
		assert.equal('', el.style.display);
	});

	it("sets the element to display:'none' if the value is false", function() {
		var el = domify("<p dj-visible='cond'></p>");
		el.style.display = '';
		var data = {cond: false};
		deja.view(data).render(el);
		assert.equal('none', el.style.display);
	});

	it("changes the display automatically with events", function() {
		var el = domify("<p dj-visible='cond'></p>");
		el.style.display = '';
		var data = {cond: false};
		Emitter(data);
		deja.view(data).render(el);
		assert.equal('none', el.style.display);
		data.cond = true;
		data.emit('change cond');
		assert.equal('', el.style.display);
	});

	it("works on true-ish and false-ish value", function() {
		var el = domify("<p dj-visible='cond'></p>");
		var data = {cond: 0};
		Emitter(data);
		deja.view(data).render(el);
		assert.equal('none', el.style.display);
		data.cond = 1;
		data.emit('change cond');
		assert.equal('', el.style.display);
		data.cond = 'false';
		data.emit('change cond');
		assert.equal('', el.style.display);
		data.cond = '';
		data.emit('change cond');
		assert.equal('none', el.style.display);
	});

	it('clears out memory', function() {
		var el = domify("<p dj-visible='cond'></p>");
		var data = {cond: true};
		Emitter(data);
		var view = deja.view(data);
		view.render(el);
		assert.equal(view.model.listeners('change cond').length, 1);
		view.clear();
		assert.deepEqual(view.envs, []);
		assert.deepEqual(view.model.listeners('change cond'), []);
	});


});
