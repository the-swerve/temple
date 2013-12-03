var Emitter = require('emitter-component');
var assert = require('assert');
var domify = require('domify');
var deja = require('../');

suite('html');

describe('text substitutions', function () {

	it('interpolates a basic value', function() {
		var el = domify("<p dj-text>val</p>");
		var data = {val: 'hallo welt'};
		deja.view(data).render(el);
		assert(data.val == el.innerHTML);
	});

	it('accesses nested objects', function() {
		var el = domify("<p dj-text>obj.val.x.y</p>");
		var data = {obj: {val: {x: {y: 'hallo welt'}}}};
		deja.view(data).render(el);
		assert(data.obj.val.x.y == el.innerHTML);
	});

	it('updates automatically from changes', function() {
		var el = domify("<p dj-text>val</p>");
		var data = {val: 'oldval'};
		Emitter(data);
		deja.view(data).render(el);
		assert.equal('oldval', el.innerHTML);
		data.val = 'newval';
		data.emit('change val');
		assert.equal('newval', el.innerHTML);
	});

	it('interpolates arrays', function() {
		var el = domify("<p dj-text>arr</p>");
		var data = {arr: [1,2,3,4]};
		deja.view(data).render(el);
		assert('1,2,3,4' == el.innerHTML);
	});

	it('will be blank when the value is undefined', function() {
		var el = domify("<p dj-text>wat?</p>");
		var data = {};
		deja.view(data).render(el);
		assert('' == el.innerHTML);
	});

});
