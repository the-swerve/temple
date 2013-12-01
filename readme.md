
# Overview

User = function (data) {
	this.data = data;
};

Deja View is a mind-bendingly simple client-side templating library with the following features:

* Automatically updates the DOM when data is changed. No compiling templates and re-rendering stuff.
* Everything is declarative.
* 
* Only updates what
* Very easy and simple interpolation, conditionals, and loops.
* Automatically evaluates functions (your view logic) inside your data objects.
* Completely syncs with the DOM, preserving state like checkboxes and text fields when data is updated.

## Basic interpolation

We use the 'deja-text' attribute to indicate we want to interpolate some data.
In the content of that element, we give the reference to the variable or object
in our data.

	<p deja-text>greeting<p>

	view = deja.view().set({greeting: 'hallo welt!'});
	view.render('p');

	<p class='person-data' deja-text>person.name</p>
	<p class='person-data' deja-text>person.pet.name</p>

	data = {person: {name: 'Bob Ross', pet: {name: 'Fido'}}}
	view = deja.view().set(data);
	view.render('.person-data')

## Interpolating element attributes

Use 'deja-{attr}' to set that element's attributes using your view data.
Classes will be appended while all other attributes will be written over.

	<p class='account-link' deja-class='status'>Your Account</p>

	data = {status: 'invalid'};
	view = deja.view().set(data).render('.account-link');

Renders to:

	<p class='account-link invalid'>Your Account</p>

Other attributes are written over:

	<p class='account-link' deja-data-id='account.id'>Your Account</p>

	data = {account: {id: 420}};
	view = deja.view().set(data).render('.account-link');

Renders to:

	<p class='account-link' data-id='420'>Your Account</p>

## Loops

	<tr deja-loop='users' deja-as='user'>
		<td deja-text>user.name</td>
		<td deja-text>user.status</td>
		<tr deja-loop='user.comments' deja-as='comment'>
			<td deja-text>comment.content</td>
			<td deja-text>comment.created_at</td>
		</tr>
	</tr>

## Conditionals

	<p deja-visible='conditional'>This is only visible if conditional is true(-ish)</p>

## View logic

### Basic

	data = {first_name: 'Bob', last_name: 'Ross'};
	view = deja.view().set(data);

	view.set({
		full_name: function(data) {
			return data.first_name + data.last_name;
		}
	});

	view.render('p');

### Nested data logic

You can use 'seteach' to set an attribute for 

if you have an array nested in your object, you can pass it so that each
	element of the array becomes the new scope.

	data = {users: [{first: 'bob', last: 'ross'}, {first: 'fred', last: 'rogers'}]}
	view = deja.view('p', data);

	user = model({
		first_name: 'string',
		last_name: 'string'
	})

	users = collection({

	})

	view.set('users', {
		full_name: function (user) {
			return data.first_name + data.last_name;
		}
	});

	view.set('users.tags', {
		tag_status: function (tag) {
			if tag.created_at > 1 month ago
				return 'hi'
			else return 'what'
		}
	});

# Usage

    var view = deja.view(css_selector);
		view.set({hi: 1})
