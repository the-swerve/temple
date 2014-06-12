var Obj = require('obj-clone')
var Emitter = require('emitter-component')

var Temple = Obj.clone()
Temple.init = function(model) {
	this.model = model
	this.bindings = []
	this.mapping = {}
	return this
}
Emitter(Temple)

module.exports = Temple

Temple.load = function(model) {this.model = model; return this}

Temple.render = function(node) {
	var self = this
	self.find_interpolations(node)
	each(self.bindings, function(binding) {
		self.render_binding(binding)
	})
	return self
}

Temple.find_interpolations = function(parent) {
	var self = this
	each_node(parent, function(node) {
		if (node.nodeType === 3) // Text node
			return self.bind_text(node)
		else if (node.nodeType === 1) // Element node
			return self.bind_attrs(node)
	})
}

Temple.bind_loop = function(attr, node) {
	var self = this
	node.removeAttribute('each')
	var binding = {loop: node, prop: attr.value, parent: node.parentNode}
	self.bindings.push(binding)
	self.map_property_to_binding(attr.value, binding)
}

Temple.bind_attrs = function(node) {
	var self = this
	var traverse_children = true
	if (!node.attributes) return
	each(node.attributes, function(attr) {
		if (attr.name === 'each') {
			self.bind_loop(attr, node)
			traverse_children = false
			return
		}
		var props = self.parse_interpolations(attr.value)
		if (!props) return
		var binding = {attr: attr, props: props, orig: attr.value}
		self.bindings.push(binding)
		each(props, function(prop) {
			self.map_property_to_binding(prop, binding)
		})
	})
	return traverse_children
}

Temple.bind_text = function(node) {
	var self = this
	var props = self.parse_interpolations(node.textContent)
	if (!props) return
	var binding = {node: node, props: props, orig: node.textContent}
	self.bindings.push(binding)
	each(props, function(prop) {
		self.map_property_to_binding(prop, binding)
	})
	return true
}

Temple.map_property_to_binding = function(prop, binding) {
	var self = this
	self.mapping[prop] = self.mapping[prop] || []
	self.mapping[prop].push(binding)
	self.subscribe(self.model, prop, function() {self.render_binding(binding)})
}

// String -> [String]
Temple.parse_interpolations = function(str) {
	var self = this
	var re = self.interpolator('(.+?)')
	var matches = str.match(re)
	if (!matches) return
	return map(matches, function(match) {
		return match.replace(' ','').replace(re, "$1").trim()
	})
}

// Take an original string from the template and interpolate the data using an array of properties
Temple.interpolate = function(str, props) {
	var self = this
	each(props, function(prop) {
		var regex = self.interpolator('(' + prop + ')')
		if (prop === 'this')
			var val = self.model
		else 
			var val = self.get_nested_val(prop.split('.'))
		if (val === undefined || val === null)
			val = ''
		str = str.replace(regex, val)
	})
	return str
}

Temple.render_binding = function(binding) {
	var self = this
	if (binding.loop) {
		self.render_loop(binding)
		return
	}
	var interpolated = self.interpolate(binding.orig, binding.props)
	if (binding.attr) binding.attr.value = interpolated
	else if (binding.node) binding.node.textContent = interpolated
}

Temple.render_loop = function(binding) {
	var self = this
	var arr = self.get_nested_val(binding.prop.split('.'))
	if (!arr) return
	binding.parent.innerHTML = ''
	each(arr, function(elem) {
		var new_node = binding.loop.cloneNode(true)
		var new_template = Temple.clone(elem)
		binding.parent.appendChild(new_node)
		new_template.render(new_node)
	})
}

Temple.clear = function() {
	var self = this
	self.unsubscribe(self.model)
	self.bindings = []
	self.mapping = {}
	return self
}

Temple.interpolator = function(substr) {
	return new RegExp(escape_regex(this.left_delimiter) + "\\s*" + substr + "\\s*" + escape_regex(this.right_delimiter), 'g')
}

// self.model: {a: {b: 'hi'}}
// props: ['a', 'b']
// Return: 'hi'
Temple.get_nested_val = function(props) {
	var self = this
	var val = self.model
	each(props, function(prop) {
		if (val) val = self.get(val, prop)
	})
	return val
}

Temple.left_delimiter = "{"
Temple.right_delimiter = "}"

Temple.get = function(model, property) {
	return model[property]
}

Temple.subscribe = function(model, property, render_function) {
	if (typeof model.on === 'function') model.on('change ' + property, render_function)
}

Temple.unsubscribe = function(model) {
	if (typeof model.off === 'function') model.off()
}

function each(arr, fn) { for(var i = 0; i < arr.length; ++i) fn(arr[i]) }

function map(arr, fn) { var a = []; for(var i = 0; i < arr.length; ++i) a.push(fn(arr[i])); return a }

function escape_regex(str) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function each_node(node, fn) {
	var stack = [node]
	while (stack.length > 0) {
		var current_node = stack.pop()
		var result = fn(current_node)
		if (result) each(current_node.childNodes, function(n) {stack.push(n)})
	}
}
