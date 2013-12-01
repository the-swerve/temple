#/bin/bash

while :; do
	inotifywait -e modify $1
	browserify $1 > bundle.js
done
