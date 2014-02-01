var Emitter = require('emitter-component');
var assert = require('assert');
var domify = require('domify');
var deja = require('../');

suite('html');

describe('text substitutions', function () {

	it('interpolates a basic value into a given node', function() {
		var el = domify("<p dj-text='val'>old</p>");
		var data = {val: 'hallo welt'};
		deja.view(data).render(el);
		assert(data.val == el.innerHTML);
	});

	it('renders to a list of nodes', function() {
		var el0 = domify("<p dj-text='val'>old</p>");
		var el1 = el0.cloneNode(true);
		var el2 = el0.cloneNode(true);
		var data = {val: 'hallo welt'};
		deja.view(data).render([el0, el1, el2]);
		assert(data.val == el0.innerHTML);
	});

	it('renders to a query string', function() {
		var el = domify("<p id='uniqqq' dj-text='val'>old</p>");
		document.body.appendChild(el);
		var data = {val: 'hallo welt'};
		deja.view(data).render('#uniqqq');
		assert(data.val == el.innerHTML);
	});

	it('accesses nested objects', function() {
		var el = domify("<p dj-text='obj.val.x.y'>old</p>");
		var data = {obj: {val: {x: {y: 'hallo welt'}}}};
		deja.view(data).render(el);
		assert(data.obj.val.x.y == el.innerHTML);
	});

	it('updates automatically from changes', function() {
		var el = domify("<p dj-text='val'>old</p>");
		var data = {val: 'oldval'};
		Emitter(data);
		deja.view(data).render(el);
		assert.equal('oldval', el.innerHTML);
		data.val = 'newval';
		data.emit('change val');
		assert.equal('newval', el.innerHTML);
	});

	it('interpolates arrays', function() {
		var el = domify("<p dj-text='arr'>old</p>");
		var data = {arr: [1,2,3,4]};
		deja.view(data).render(el);
		assert('1,2,3,4' == el.innerHTML);
	});

	it('will not replace text when the value is undefined', function() {
		var el = domify("<p dj-text='wat'>old</p>");
		var data = {};
		deja.view(data).render(el);
		assert('old' == el.innerHTML);
	});

	it('clears out memory', function() {
		var el = domify("<p dj-text='val'>old</p>");
		var data = {val: 'hi'};
		Emitter(data);
		var view = deja.view(data);
		view.render(el);
		assert.equal(view.model.listeners('change val').length, 1);
		view.clear();
		assert.deepEqual(view.envs, []);
		assert.deepEqual(view.model.listeners('change val'), []);
	});

});
