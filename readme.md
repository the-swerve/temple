
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

We use the 'deja-text' attribute to indicate we want to interpolate some data.
In the content of that element, we give the reference to the variable or object
in our data.

	<p deja-text>greeting<p>

	var view = deja.view({greeting: 'hallo welt!'});
	view.render('p');

## Interpolating element attributes

Use 'deja-{attr}' to set that element's attributes using your view data.
Classes will be appended while all other attributes will be written over.

	<a class='account-link' deja-class='status'>Your Account</a>

	var data = {status: 'invalid'};
	var view = deja.view(data)
	view.render('.account-link');

The above renders to:

	<a class='account-link invalid'>Your Account</a>

Other attributes are written over:

	<a class='account-link' deja-data-id='account.id'>Your Account</a>

	var data = {account: {id: 420}};
	var view = deja.view(data)
	view.render('.account-link');

Renders to:

	<a class='account-link' data-id='420'>Your Account</a>

## Loops

Use the *deja-loop* attribute.

	<tr deja-loop='users' deja-as='user'>
		<td deja-text>user.name</td>
		<td deja-text>user.status</td>

		<tr deja-loop='user.comments'>
			<td deja-text>this.content</td>
			<td deja-text>this.created_at</td>
		</tr>

	</tr>

*deja-as* will scope every element of the list to a name, such as "user." You
can leave out *deja-as*, in which case each element can be referred to with
'this.'

## Conditionals

	<p deja-visible='conditional'>This is only visible if 'conditional' is true(-ish)</p>
