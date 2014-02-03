# temple

Declarative and reactive client side templating.

* Pure html and js.
* All declarative templating.
* Reactive data bindings.
* No view logic allowed (put it in your js).
* No dependencies.
* Works with IE6+, Chrome, Firefox, Safari, and Opera

This lib supports the idea that your html is only the declaration and layout of your data, while your js defines the logic and animation of that data.

It is up to your data model to emit change events, create computed properties, sync with the server, and so on. Some examples to use alongside temple are [bamboo](https://github.com/defunctzombie/bamboo), [model](https://github.com/component/model), and [modella](https://github.com/modella/modella).

This lib is heavly inspired by [reactive](https://github.com/component/reactive).

# installation

With [component](https://github.com/component/component):

```sh
component install the-swerve/temple
```

With [npm](http://npmjs.org) and [browserify](http://browserify.org/):

```sh
npm install temple-component
```

# usage

Instantiate like:

```js
var temple = require('temple');
var template = temple(data_model);
template.render(element);
```

Where `data_model` is an object containing your data that will emit events when
its properties are changed.

`element` can be a DOM Node, an array of Nodes, or a NodeList. You can repeatedly render the view into any number number of elements.

# interpolation

We use the `data-text` attribute to indicate we want to interpolate something into the text of the element.

```html
<p data-text='greeting'>Some default text<p>
```

```js
var view = temple({greeting: 'hallo welt!'});
view.render('p');
```

Result:

```html
<p>hallo welt!</p>
```

# interpolating attributes

Use `data-{attr}` to set that element's attributes using your view data.
Classes will be appended while all other attributes will be written over.

```html
<a class='account-link' data-class='status'>Your Account</a>
```

```js
var view = temple({status: 'invalid'})
view.render('.account-link');
```

The above renders to:

```html
<a class='account-link invalid'>Your Account</a>
```

Other attributes are written over:

```html
<a class='account-link' data-data-id='account.id'>Your Account</a>
```

```js
var view = temple({account: {id: 420}});
view.render('.account-link');
```

Renders to:

```html
<a class='account-link' data-id='420'>Your Account</a>
```

## loops

Use the `data-each` attribute and access each element using `each`

```html
<div data-each='users'>
	<p data-text='each.name'></p>
	<p data-text='each.status'></p>

	<ul data-each='each.comments'>
		<li>
			<span data-text='each'></span>
		</li>
	</ul>
</div>
```

To refer to the element itself within the loop, just use `each`.

# dynamic changes

If your data object emits `change {property}` events, then temple will
automatically sync your changed data into the DOM.

temple only syncs data to the nodes that are bound to them without re-rendering anything else.

For example: if you have a table of users with checkboxes next to each row, then the checkboxes will not be reset when the data updates.

# clearing memory

You can call `view.clear()` (where `view` is an instance of temple) to clear out all listeners, free up memory, and reset the DOM.

# configuration

### custom subscriptions/listeners

By default, temple listens for events on your model using `model.on('change ' + prop, render_func)`. You can use `temple.config` to customize this. For example, if you wanted to instead do `model.bind(prop, render_func)`, you can do:

```js
temple.config({
	listen: function(model, prop, render_func) {
		model.bind(prop, render_func);
	}
});
```

### custom data access

By default, temple uses `data[property]` to access your data. You can custom this using `temple.config`. For example, to change the accessor to `model.get(property)`, you can do:

```js
temple.config({
	get: function(model, property) {
		return model.get(property);
	}
});
```

### custom attribute prefix

Instead of 'data-', you can use your own custom prefix for temple attributes. For example, to have temple recognize all attributes with the prefix `--` (yes, that will actually work), simply do:

```js
temple.config({
	prefix: '--'
})
```
