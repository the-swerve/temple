
# Overview

A mind-bendingly simple client-side templating library with the following features:

* Update data in the dom dynamically when it changes without re-rendering.
* Make declarative templates.
* No view logic.
* Loops and conditionals and loops within loops.
* Updating loops will sync the data to your dom without re-rendering elements -- state like checkboxes and fields won't be touched.

## Usage

	var view = deja.view(data_model);
	view.render(query_selector);

Where *data_model* is an object containing your view's data that will emit
events when its properties are changed.

*query_selector* is string for selecting the element(s) you want this view to
render into.

## Interpolation

We use the 'dj-text' attribute to indicate we want to interpolate some data.
In the content of that element, we give the reference to the variable or object
in our data.

	<p dj-text>greeting<p>

	var view = deja.view({greeting: 'hallo welt!'});
	view.render('p');

## Interpolating element attributes

Use 'dj-{attr}' to set that element's attributes using your view data.
Classes will be appended while all other attributes will be written over.

	<a class='account-link' dj-class='status'>Your Account</a>

	var data = {status: 'invalid'};
	var view = deja.view(data)
	view.render('.account-link');

The above renders to:

	<a class='account-link invalid'>Your Account</a>

Other attributes are written over:

	<a class='account-link' dj-data-id='account.id'>Your Account</a>

	var data = {account: {id: 420}};
	var view = deja.view(data)
	view.render('.account-link');

Renders to:

	<a class='account-link' data-id='420'>Your Account</a>

## Loops

Use the *dj-loop* attribute.

	<tr dj-loop='users' dj-as='user'>
		<td dj-text>user.name</td>
		<td dj-text>user.status</td>

		<tr dj-loop='user.comments'>
			<td dj-text>this.content</td>
			<td dj-text>this.created_at</td>
		</tr>

	</tr>

*dj-as* will scope every element of the list to a name, such as "user." You
can leave out *dj-as*, in which case each element can be referred to with
'this.'

## Conditionals

Use the *dj-visible* attribute. This will set the element to either
display:none or display:'' if the value is false-ish or true-ish.

	<p dj-visible='conditional'>This is only visible if 'conditional' is true(-ish)</p>

## Callbacks

You can use *before_render* and *after_render* to run a function right before
or after your view renders. You can also pass specific property names to run
different functions depending on which properties are getting rendered or
re-rendered.

	<div dj-text>property</div>

	var view = deja.view({property: 'hi'});
	view.render('div');
	view.before_render(function() {
		console.log('before rendering anything');
	});
	view.before_render(function() {
		console.log('after rendering anything');
	});
	view.before_render('property', function() {
		console.log('before rendering property');
	});
	view.after_render('property', function() {
		console.log('after rendering property');
	});
	view.before_render(['prop1', 'prop2'], function() {
		console.log('after rendering either prop1 or prop2');
	});
	view.before_render(['prop1', 'prop2'], function() {
		console.log('after rendering either prop1 or prop2');
	});
