var Obj = require('obj-clone')

var Temple = Obj.clone()
Temple.init = function(model) {
	this.model = model
	this.bindings = []
	this.mapping = {}
	return this
}

module.exports = Temple

Temple.render = function(node) {
	var self = this
	self.find_bindings(node)
	each(self.bindings, function(binding) {
		self.render_binding(binding)
	})
	node.className += ' temple-rendered'
	return self
}

Temple.set = function(model) {
	this.model = model
	return this
}

Temple.find_bindings = function(parent) {
	var self = this
	// Find all {} interpolations
	each_node(parent, function(node) {
		if (node.nodeType === 3) // Text node
			return self.bind_text(node)
		if (node.nodeType === 1) // Element node
			if (node.getAttribute('each'))
				return self.bind_attr('each', node, false)
			else
				return self.bind_attrs(node)
	})
}

Temple.bind_attrs = function(node) {
	var self = this
	each(node.attributes, function(attr) {
		var props = self.parse_interpolations(attr.value)
		if (props) {
			var binding = {attr: attr, props: props, orig: attr.value}
			self.bindings.push(binding)
			each(props, function(prop) {
				self.map_property_to_binding(prop.match, binding)
			})
		}
	})
	return true
}

// Create a binding object for 'each', 'if', or 'unless'
// eg: {each: <div>..</div>, prop: 'prop', parent, <body>..</body>}
Temple.bind_attr = function(key, node, traverse_children) {
	var self = this
	var prop = node.getAttribute(key)
	node.removeAttribute(key)
	var binding = {prop: prop, parent: node.parentNode}
	binding[key] = node.cloneNode(true)
	self.bindings.push(binding)
	self.map_property_to_binding(prop, binding)
	return traverse_children
}

// Create a binding for an interpolation 
// eg: <div>{hi}</div>
// {node: div, props: [hi], orig: '{hi}'} 
Temple.bind_text = function(node) {
	var self = this
	var props = self.parse_interpolations(node.textContent)
	if (!props)
		return false
	var binding = {node: node, props: props, orig: node.textContent}
	self.bindings.push(binding)
	each(props, function(prop) {
		self.map_property_to_binding(prop.match, binding)
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
		match = match.replace(re, "$1").trim()
		var conds = match.split('?')
		if (conds.length === 2)
			return {match: conds[0].trim(), cond: conds[1].trim()}
		else
			return {match: match}
	})
}

// Take an original string from the template and interpolate the data using an array of properties
Temple.interpolate = function(str, props) {
	var self = this
	each(props, function(prop) {
		var reg = '(' + prop.match + ')'
		if (prop.cond) {
			reg = '(' + prop.match + "\\s*\\?\\s*" + prop.cond + ')'
			var val = self.get_nested_val(prop.match) ? prop.cond : ''
		}
		else if (prop.match === 'this')
			var val = self.model
		else
			var val = self.get_nested_val(prop.match)

		var regex = self.interpolator(reg)
		if(val === undefined || val === null) val = ''
		val = String(val).replace(/\$/g, "$$$$")
		str = str.replace(regex, String(val) || '')
	})
	return str
}

Temple.render_binding = function(binding) {
	var self = this
	if (binding.each) {
		self.render_loop(binding)
		return
	} else if (binding.cond)
		self.render_cond(binding)
	else if (binding.unless)
		self.render_cond(binding)
	var interpolated = self.interpolate(binding.orig, binding.props)
	if (binding.attr) binding.attr.value = interpolated
	else if (binding.node) binding.node.textContent = interpolated
}

Temple.render_cond = function(binding) {
	var self = this
	var bool = self.get_nested_val(binding.prop)
	if (bool && binding.unless)
		binding.parent.removeChild(binding.unless)
	else if (binding.cond)
		binding.parent.removeChild(binding.cond)
}

Temple.render_loop = function(binding) {
	var self = this
	var arr = self.get_nested_val(binding.prop)
	if (!arr) return
	binding.parent.innerHTML = ''
	each(arr, function(elem) {
		var new_node = binding.each.cloneNode(true)
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
	each(props.split('.'), function(prop) {
		if (val) val = self.get(val, prop)
	})
	return val
}

Temple.left_delimiter = "{"
Temple.right_delimiter = "}"

Temple.get = function(model, property) {
	if(typeof model.get === 'function') 
		return model.get(property)
	else
		return model[property]
}

Temple.subscribe = function(model, prop, render_function) {
	if (typeof model.on === 'function')
		model.on('change ' + prop, render_function)
}

Temple.unsubscribe = function(model) {
	if (typeof model.off === 'function')
		model.off()
}

function each(arr, fn) {
	if(!arr) return
	for(var i = 0; i < arr.length; ++i)
		fn(arr[i])
}

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
