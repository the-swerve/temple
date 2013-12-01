
var deja = require('../');

var test = deja.view({
	greeting: {message: 'Hallo welt'},
	name: 'Bob Ross',
	id: 420,
	class: 'greeting-thing',
	walruses: [
		{first_name: 'Benedict', last_name: 'Freypill'},
		{first_name: 'Hecuba', last_name: 'Gerbil'},
		{first_name: 'Henry', last_name: 'Grimp'}
	]
});

test.render('#greeting');
