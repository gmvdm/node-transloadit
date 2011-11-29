var transloadit = require('../');
var assert = require('assert');

describe('Client creation', function() {
    it('should create without error', function() {
        var client = new transloadit('AUTH_KEY', 'AUTH_SECRET');
        assert.equal(client.authKey, 'AUTH_KEY');
        assert.equal(client.authSecret, 'AUTH_SECRET');
        assert.equal(typeof(client.send), 'function');
    });
});