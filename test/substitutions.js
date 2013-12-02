var Emitter = require('emitter-component');
var assert = require('assert');

var deja = require('../');

suite('html');

describe('text substitutions', function () {

	it('interpolates a basic value', function() {
		var el = document.createElement('p');
		el.setAttribute('deja-text');
		el.innerHTML = 'val';
		var data = {val: 'hallo welt'};
		deja.view(data).render(el);
		assert(data.val == el.innerHTML);
	});

	it('accesses nested objects', function() {
		var el = document.createElement('p');
		el.setAttribute('deja-text');
		el.innerHTML = 'obj.val';
		var data = {obj: {val: 'hallo welt'}};
		deja.view(data).render(el);
		assert(data.obj.val == el.innerHTML);
	});

	it('interpolates arrays', function() {
		var el = document.createElement('p');
		el.setAttribute('deja-text');
		el.innerHTML = 'arr';
		var data = {arr: [1,2,3,4]};
		deja.view(data).render(el);
		assert('1,2,3,4' == el.innerHTML);
	});

});
