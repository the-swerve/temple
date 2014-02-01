# deja [![Build Status](https://travis-ci.org/the-swerve/deja.png?branch=master)](https://travis-ci.org/the-swerve/deja)

Declarative and reactive javascript templating.

* Pure html and js.
* All declarative templating.
* Reactive data bindings. Syncs data with individual nodes in the dom.
* No view logic allowed (put it in your js).
* No dependencies.
* Works with IE6+, Chrome, Firefox, Safari, and Opera

This lib supports the idea that your html is only the declaration and layout of your data, while your js defines the logic and animation of that data.

It is up to your data model to emit change events, create computed properties, sync with the server, etc. Some examples are [bamboo](https://github.com/defunctzombie/bamboo), [model](https://github.com/component/model), and [modella](https://github.com/modella/modella).

This lib is heavly inspired by [reactive](https://github.com/component/reactive).

# usage

Install with:

```sh
npm install deja-view
```

Instantiate like:

```js
var deja = require('deja');
var view = deja.view(data_model);
view.render(element);
```

Where `data_model` is an object containing your view's data that will emit
events when its properties are changed.

`element` can be a DOM Node, an array of Nodes, or a NodeList. You can repeatedly render the view into any number number of elements.

# interpolation

We use the `dj-text` attribute to indicate we want to interpolate something into the text of the element.

```html
<p dj-text='greeting'>Some default text<p>
```

```js
var view = deja.view({greeting: 'hallo welt!'});
view.render('p');
```

Result:

```html
<p>hallo welt!</p>
```

# interpolating attributes

Use `dj-{attr}` to set that element's attributes using your view data.
Classes will be appended while all other attributes will be written over.

```html
<a class='account-link' dj-class='status'>Your Account</a>
```

```js
var view = deja.view({status: 'invalid'})
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
var view = deja.view({account: {id: 420}});
view.render('.account-link');
```

Renders to:

```html
<a class='account-link' data-id='420'>Your Account</a>
```

## loops

Use the `dj-each` attribute and access each element using `each`

```html
<div dj-each='users'>
	<p dj-text='each.name'></p>
	<p dj-text='each.status'></p>

	<ul dj-each='each.comments'>
		<li>
			<span dj-text='each'></span>
		</li>
	</ul>
</div>
```

To refer to the element itself within the loop, just use `each`.

# dynamic changes

If your data object emits `change {property}` events, then deja will
automatically sync your changed data into the DOM.

deja only syncs data to the nodes that are bound to them without re-rendering anything else.

For example: if you have a table of users with checkboxes next to each row, then the checkboxes will not be reset when the data updates.

# clearing memory

You can call `view.clear()` (where `view` is an instance of deja.view) to clear out all listeners, free up memory, and reset the DOM.

# configuration

### custom subscriptions/listeners

By default, deja listens for events on your model using `model.on('change ' + prop, render_func)`. You can use `deja.config` to customize this. For example, if you wanted to instead do `model.bind(prop, render_func)`, you can do:

```js
deja.config({
	listen: function(model, prop, render_func) {
		model.bind(prop, render_func);
	}
});
```

### custom data access

By default, deja uses `data[property]` to access your data. You can custom this using `deja.config`. For example, to change the accessor to `model.get(property)`, you can do:

```js
deja.config({
	get: function(model, property) {
		return model.get(property);
	}
});
```

### custom attribute prefix

Instead of 'dj-', you can use your own custom prefix for deja attributes. For example, to have deja recognize all attributes with the example prefix `data-tmpl-`, simply do:

```js
deja.config({
	prefix: 'data-tmpl-'
})
```
