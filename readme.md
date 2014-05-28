# temple

Super simple dynamic templating.

ie6+

# installation

[component](http://component.io/)

```sh
component install the-swerve/temple
```

# api

#### Temple.clone(data)

Create your own templating object by [cloning](https://github.com/the-swerve/obj) and passing in your data.

```js
var Temple = require('temple')
var UserView = Temple.clone({name: 'bob ross'})
```

You can also do `Temple.clone()` and then later do `Temple.load(model)` if
you don't want to load the model right away.

#### Temple.render(dom_node)

```js
var el = query('#user-profile')
UserView.render(el)
```

#### Temple.clear()

You can call `View.clear()` to clear out all listeners, free up memory, and reset the DOM.

#### interpolation

You can use `{property}` anywhere in the dom to interpolate data.

```html
<p>{greeting}</p>
```

```js
var el = query('p')
var model = {greeting: 'hallo welt!'}
var view = Temple.clone(model).render(el)
```

Result:

```html
<p>hallo welt!</p>
```

#### loops

Use the `each` attribute. Within the element having the `each` attribute (and the element itself), all properties are scoped to each element in the array.

```html
<div each='users' data-id={id}>
	<p>{name}</p>
	<p>{status}</p>

	<ul each='comments'>
		<li>{this}</li>
	</ul>
</div>
```

To refer to the element itself within the loop, use `this`.

# dynamic changes

If your data model emits `change {property}` events, then Temple will automatically update the DOM using your changed data. You never have to re-render the template. Only call `render` once at the beginning, and then every change to the data will update in the DOM.

# configuration

You can customize Temple's entire interface using `Temple.config`.

#### Temple.config.listen(model, property, render_function)

By default, Temple listens for events on your model using `model.on('change property', render)`. If you wanted to instead listen with, for example, `model.bind(property, render)`, you can do:

```js
Temple.config.listen = function(model, prop, render) {
	model.bind(prop, render)
}
```

`listen` does not need a return value.

#### Temple.config.get

By default, Temple uses `data[property]` to access your data. To use libraries like backbone or citizen, where the model attributes are retrieved with `model.get(property)`, you can do:

```js
Temple.config.get = function(model, property) {
	return model.get(property)
}
```

The return value of `get` should be the retrieved attribute.

#### Temple.config.left_delimiter, Temple.config.right_delimiter

You can change the interpolation pattern from `{property}` to something else. Pass in the left and right delimiters as strings. For example, to interpolate using `#{property}` instead:

```js
Temple.config.left_delimiter = '#{'
Temple.config.right_delimiter = '}'
```

Or to use erb-style, `<%= property %>':

```js
Temple.config.left_delimiter = '<%='
Temple.config.right_delimiter = '%>'
```

You don't have to escape any characters like `{` or `[` -- they will be escaped automatically.

# tests

Test locally with `component test browser` (from the root)

# compatible libs

Models that emit change events that you can use alongside Temple include: [citizen](https://github.com/the-swerve/citizen), [model](https://github.com/component/model), [modella](https://github.com/modella/modella), [bamboo](https://github.com/defunctzombie/bamboo).
