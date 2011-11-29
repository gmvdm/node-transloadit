TESTS = test/*.js

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
               --require should \
		$(TESTS)

test-cov:
	@TESTFLAGS=--cov $(MAKE) test

lint:
	find . -not -path '*node_modules*' -and -name '*.js' -print0 | xargs -0 jslint

.PHONY: test test-cov lint