
# Overview

A mind-bendingly simple client-side templating library with the following features:

* Update data in the dom dynamically when it changes without re-rendering.
* Make declarative templates.
* No view logic.
* Loops and conditionals and loops within loops.
* Updating loops will sync the data to your dom without re-rendering elements -- user state like checkboxes and fields won't be touched.

## Usage

	var view = deja.view(data_model);
	view.render(element);

Where *data_model* is an object containing your view's data that will emit
events when its properties are changed.

*element* can be a query selector string, a DOM Node, or a NodeList. You can
render "view" into any amount of nodes.

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

	<div dj-loop='users' dj-as='user'>
		<p dj-text>user.name</p>
		<p dj-text>user.status</p>

		<ul dj-loop='user.comments'>
			<li>
				<span dj-text>this.content</span>
				<span dj-text>this.created_at</span>
			</li>
		</ul>
	</div>

*dj-as* will scope every element of the list to a name, such as "user." If
leave out *dj-as*, you can refer to each element in the array with "this."

## Conditionals

Use the *dj-visible* attribute. This will set the element to either
display:none or display:'' if the value is false-ish or true-ish.

	<p dj-visible='conditional'>This is only visible if 'conditional' is true(-ish)</p>

## Dynamic changes

If your data model emits 'change {property}' events, then deja will
automatically re-render your data in the DOM on those changes.

## Callbacks

These are coming soon. Here is how they might work:

Use *before_render* and *after_render* to run a function right before
or after your view renders. You can also pass specific property names to run
different functions depending on which properties are getting rendered or
re-rendered.

	<div dj-text>property</div>

	var view = deja.view({property: 'hi'});
	view.render('div');
	view.before_render(function() {
		console.log('before rendering anything in the view');
	});
	view.after_render(function() {
		console.log('after rendering anything in the view');
	});
	view.before_render('property', function() {
		console.log('before rendering a specific property');
	});
	view.after_render('property', function() {
		console.log('after rendering a specific property');
	});
	view.before_render(['prop1', 'prop2'], function() {
		console.log('before rendering either prop1 or prop2');
	});
	view.after_render(['prop1', 'prop2'], function() {
		console.log('after rendering either prop1 or prop2');
	});

## Custom subscriptions

Coming soon.
