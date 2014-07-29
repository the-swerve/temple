# temple

Super simple dynamic templating.

ie8+

# installation

```sh
npm install dom-template
```

# api

#### Temple.clone(data)

```js
var Temple = require('temple')
var UserView = Temple.clone({name: 'bob ross'})
```

You can also do `Temple.clone()` and then later do `Temple.set(model)` if
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

#### conditionals

You can use a `?` within interpolations to do conditionals -- useful for assigning classes based on bools.

```html
<p class={anonymous ? hide}>{name}</p>
```

Everything after the `?` is a string that will be interpolated if the boolean is true

# dynamic changes

If your data model emits `change {property}` events, then Temple will automatically update the DOM using your changed data. You never have to re-render the template. Only call `render` once at the beginning, and then every change to the data will update in the DOM.

# configuration

You can customize Temple's entire interface by simply overriding certain properties.

#### Temple.listen(model, property, render_function)

By default, Temple listens for events on your model using `model.on('change property', render)`. If you wanted to instead listen with, for example, `model.bind(property, render)`, you can do:

```js
Temple.listen = function(model, prop, render) {
	model.bind(prop, render)
}
```

`listen` does not need a return value.

#### Temple.get

By default, Temple uses either of `data[property]` or data.get(property) to access your data. To use a library where the model attributes are retrieved with `model.fetch(property)`, you can do:

```js
Temple.get = function(model, property) {
	return model.fetch(property)
}
```

The return value of `get` should be the retrieved attribute.

#### Temple.left_delimiter, Temple.right_delimiter

You can change the interpolation pattern from `{property}` to something else. Pass in the left and right delimiters as strings. For example, to interpolate using `#{property}` instead:

```js
Temple.left_delimiter = '#{'
Temple.right_delimiter = '}'
```

Or to use erb-style, `<%= property %>':

```js
Temple.left_delimiter = '<%='
Temple.right_delimiter = '%>'
```

You don't have to escape any characters like `{` or `[`.

#### Avoiding flashing of interpolation characters

Since Temple is designed to render directly into your dom, we might get a flash of `{property}` text for interpolated properties on slow connections before the template has loaded data. To avoid this, I recommend setting a template class such as 'temple' to your template elements. Temple will add the class 'temple-rendered' when the data is finished rendering into the element. For example:

```html
<div class='temple'>{prop}</div>
```

Set `.temple` to initially be hidden and `.temple.temple-rendered` to display.

```css
.temple {
	display: none;
}

.temple.temple-rendered {
	display: block;
}
```

Temple renders and finishes...

```html
<div class='temple temple-rendered'>Hello!</div>
```

# compatible libs

Models that emit change events that you can use alongside Temple include: [citizen](https://github.com/the-swerve/citizen), [model](https://github.com/component/model), [modella](https://github.com/modella/modella), [bamboo](https://github.com/defunctzombie/bamboo).

