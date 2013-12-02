var deja = require('../');
var Model = require('bamboo/model');
var emitter = require('emitter-component');

var App = Model({
	greeting: {
		message: String
	},
	name: String,
	id: Number,
	class: String,
	walruses: [{first_name: String, last_name: String, comments: [String], cool: Boolean}],
	cond_a: Boolean,
	cond_b: Boolean,
	basic_list: [Number]
});

app = App();

app.greeting = {message: 'Hallo welt'};
app.name = 'Bob Ross';
app.id = 420;
app.class = 'greeting-thing';
app.walruses = [
	{first_name: 'Benedict', last_name: 'Frulth', comments: ['lol', 'wat'], cool: true},
	{first_name: 'Hecuba', last_name: 'Gerbil', comments: ['hi', 'hello', 'greetings'], cool: false},
	{first_name: 'Henry', last_name: 'Grimp', comments: ['where am i?'], cool: true}
];
app.basic_list = [1, 2, 3, 4];
app.cond_a = true;
app.cond_b = false;

var test = deja.view(app);

test.render('#greeting');

setTimeout(function() {
	app.name = 'Bill Clinton';
}, 3000);

setTimeout(function() {
	console.log('changing basic list');
	app.basic_list = [6,7,8];
}, 1000);
