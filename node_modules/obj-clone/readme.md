# obj

A very tiny library that turns `Object.create()` into a method called `clone`,
where the idea is to use a simple system of cloning and mixing prototypes:

#### Obj.clone()

```js
var Fruit = Obj.clone()
Fruit.taste = 'sweet'
Fruit.eat = function() {return 'it tasted ' + this.taste}

var Apple = Fruit.clone()
Apple.texture = 'crunchy'
Apple.eat = function() { return Fruit.eat.call(this) + ' and ' + this.texture }

Apple.taste === 'sweet' // true
Apple.eat() // 'it tasted sweet and crunchy'
```

#### Obj.init()

`init` acts as a constructor for cloned objects. It is run when `clone` is called using any arguments passed to `clone`. For example, you may want a new object insantiated each time the original object is cloned:

```js
var Original = Obj.clone()
Original.init = function(param) { this.new_obj = {key: param} }

var MyClone = Original.clone('my value!')

Original.new_obj //undefined
MyClone.new_obj //{key: 'my value!'}
```

#### Obj.mixin()
There's also a `mixin` method, allowing you to mix another object's properties
into your own object. It will override existing
defined properties.

```js
var Edible = Obj.clone()
Edible.eat = function() {return 'it tasted ' + this.taste}

var Kale = Obj.clone()
Kale.taste = 'bitter'
Kale.mixin(Edible)

Kale.eat() // 'it tasted bitter'
```

#### installation

```sh
npm install the-swerve/obj
```

#### compatibility

ie6+

A polyfill is provided for browsers that don't have `Object.create` defined.
