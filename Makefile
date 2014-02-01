
build: components index.js lib/attr_sub.js lib/config.js lib/environment.js lib/interpolation.js lib/loop.js lib/text_sub.js lib/utils.js
	@component build --dev

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

.PHONY: clean
