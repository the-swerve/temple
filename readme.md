
# deja

A mind-bendingly simple client-side templating library with the following features:

* Update data in the dom dynamically when it changes without re-rendering.
* Make declarative templates.
* No view logic.
* Loops and conditionals and loops within loops.
* Updating loops will sync the data to your dom without re-rendering elements -- user state like checkboxes and fields won't be touched.

## Usage

```js
var view = deja.view(data_model);
view.render(element);
```

Where *data_model* is an object containing your view's data that will emit
events when its properties are changed.

*element* can be a query selector string, a DOM Node, an array of Nodes, or a NodeList. You can
render "view" into any amount of nodes.

## Interpolation

We use the 'dj-text' attribute to indicate we want to interpolate some data.
In the content of that element, we give the reference to the variable or object
in our data.

```html
<p dj-text>greeting<p>
```

```js
var view = deja.view({greeting: 'hallo welt!'});
view.render('p');
```

## Interpolating element attributes

Use 'dj-{attr}' to set that element's attributes using your view data.
Classes will be appended while all other attributes will be written over.

```html
<a class='account-link' dj-class='status'>Your Account</a>
```

```js
var data = {status: 'invalid'};
var view = deja.view(data)
view.render('.account-link');
```

The above renders to:

```html
<a class='account-link invalid'>Your Account</a>
```

Other attributes are written over:

```html
<a class='account-link' dj-data-id='account.id'>Your Account</a>
```

```js
var data = {account: {id: 420}};
var view = deja.view(data)
view.render('.account-link');
```

Renders to:

```html
<a class='account-link' data-id='420'>Your Account</a>
```

## Loops

Use the *dj-loop* attribute.

```html
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
```

*dj-as* will scope every element of the list to a name, such as "user." If
leave out *dj-as*, you can refer to each element in the array with "this."

## Conditionals

Use the *dj-visible* attribute. This will set the element to either
display:none or display:'' if the value is false-ish or true-ish.

```html
<p dj-visible='conditional'>This is only visible if 'conditional' is true(-ish)</p>
```

## Dynamic changes

If your data model emits 'change {property}' events, then deja will
automatically re-render your data in the DOM on those changes.

## Unrendering and clearing listeners

You can call *view.unrender()* (where *view* is an instance of deja.view) to clear out all listeners and free up memory. This method does not affect the DOM

## Configuration

### Custom subscriptions/listeners

By default, deja listens for events on your model using *model.on('change {property}', render_function)*. You can use *deja.config* to customize this. For example, if you wanted to instead do *model.bind(prop, render_function)*, you can do:

```js
deja.config({
	listen: function(model, prop, render_function) {
		model.bind(prop, render_function);
	}
});
```

### Custom data access

By default, deja uses *data[property]* to access your data. You can custom this using *deja.config*. For example, to change the accessor to *model.get(property)*, you can do:

```js
deja.config({
	get: function(model, property) {
		return model.get(property);
	}
});
```

## Credit

This was heavily inspired by [reactive](https://github.com/component/reactive) and [ractive](http://www.ractivejs.org/).
