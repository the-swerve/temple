
coll

ajax recieve data
        |
				|
				*
interpret data (full_name)
        |
				|
				*
render data
   |      *
	 |      |
	 *      |
   DOM ---> events

User = deja.model('/users')

User = function(data) {
	this.user = data;
};

User.prototype.full_name = function() {
	return this.data.first_name + ' ' + this.data.last_name;
};


