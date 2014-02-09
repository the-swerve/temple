# temple

Declarative and reactive client side templating.

* pure html and js.
* all declarative templating.
* reactive data bindings.
* no view logic allowed (put it in your js).
* no dependencies.
* ie6+

This lib supports the idea that your html is only the declaration and layout of your data, while your js defines the logic and animation of that data.

It is up to your data model to emit change events, create computed properties, sync with the server, and so on. Models to use alongside temple are [citizen](https://github.com/the-swerve/citizen), [model](https://github.com/component/model), and [modella](https://github.com/modella/modella).

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

We use the `tmpl-text` attribute to indicate we want to interpolate something into the text of the element.

```html
<p tmpl-text='greeting'>Some default text<p>
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

Use `tmpl-{attr}` to set that element's attributes using your view data.
Classes will be appended while all other attributes will be written over.

```html
<a class='account-link' tmpl-class='status'>Your Account</a>
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
<a class='account-link' tmpl-data-id='account.id'>Your Account</a>
```

```js
var view = temple({account: {id: 420}});
view.render('.account-link');
```

Renders to:

```html
<a class='account-link' tmpl-id='420'>Your Account</a>
```

## loops

Use the `tmpl-each` attribute. Within the `tmpl-each` element, all properties are scoped to each element in the array.

```html
<div tmpl-each='users'>
	<p tmpl-text='name'></p>
	<p tmpl-text='status'></p>

	<ul tmpl-each='comments'>
		<li>
			<span tmpl-text='each'></span>
		</li>
	</ul>
</div>
```

To refer to the element itself within the loop, use `each`.

# dynamic changes

If your data object emits `change {property}` events, then temple will
automatically sync your changed data into the DOM.

temple only syncs data to the nodes that are bound to them without re-rendering anything else.

For example: if you have a table of users with checkboxes next to each row, then the checkboxes will not be reset when the data updates.

# clearing memory

You can call `view.clear()` (where `view` is an instance of temple) to clear out all listeners, free up memory, and reset the DOM.

# configuration

You can customize temple's entire interface using `temple.config`.

#### temple.config.listen(model, property, render_function)

By default, temple listens for events on your model using `model.on('change ' + prop, render_func)`. If you wanted to instead listen with `model.bind(prop, render_func)`, you can do:

```js
temple.config({
	listen: function(model, prop, render_func) {
		model.bind(prop, render_func);
	}
});
```

`listen` does not need a return value.

#### temple.config.get

By default, temple uses `data[property]` to access your data. To use libraries like backbone or citizen, where the model attributes are retrieved with `model.get(property)`, you can do:

```js
temple.config({
	get: function(model, property) {
		return model.get(property);
	}
});
```

The return value of `get` should be the retrieved attribute.

#### temple.config.prefix

Instead of `'tmpl-'`, you can use your own custom prefix for temple attributes. For example, to have temple recognize all attributes with the prefix `'data-tmpl-'`, you can do.

```js
temple.config({
	prefix: 'data-tmpl-'
})
```

#### temple.config.index(collection, ind), temple.config.len(collection)

You can customize how temple indexes and gets the length of collections inside your models, in case your collections have a special interface. For example, with [citizen](https://github.com/the-swerve/citizen), we would want to access the array using the property `arr` within the collection:

```js
temple.config({
	len: function(coll) {
		return coll.arr.length
	},
	index: function(coll, ind) {
		return coll.arr[ind]
	}
```

#### temple.config.loop, temple.config.conditional, temple.configuration.text

You can customize any of the attribute labels for loops, conditionals, and text interpolations. For example, instead of `tmpl-text`, you could have `tmpl-inner`, for example.

```js
temple.config({
	prefix: '--',
	text: 'inner',
	loop: 'loop',
	conditional: 'only',
	inverse_conditional: 'never'
})
```

The above will create a completely alternate naming scheme with `'--inner'` for text interpolation, `'--loop'` for loops, and `'--only'` for conditionals.

# tests

Test locally with `component test browser` (from the repo's root).
