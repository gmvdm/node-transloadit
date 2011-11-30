# Overview

This is a Node.js client for the [Transloadit](http://transloadit.com/) service, a cloud transcoder for images, video and other content.

Before you get started you'll want to 
[enable API authentication](http://transloadit.com/docs/authentication).

# Installation

    npm install node-transloadit

# API

```javascript

var transloadit = require('node-transloadit');

var client = new transloadit('AUTH_KEY', 'AUTH_SECRET');

client.addStream(name, file_name, mime_type, size, stream);
client.addFile(file_name, file_path);
client.send(params, ok_callback, fail_callback);

```

# Example

```javascript

var transloadit = require('node-transloadit');

var client = new transloadit('AUTH_KEY', 'AUTH_SECRET');
var params = {
    steps: {
        ':original': {
            robot: '/http/import',
            url: 'http://example.com/file.mov'
        }
    },
    template_id: 'your_template_id_here'
};

client.send(params, function(ok) {
    // success callback [optional]
    console.log('Success: ' + JSON.stringify(ok));
}, function(err) {
    // error callback [optional]
    console.log('Error: ' + JSON.stringify(err));
});

```

# Authors

- Geoff Wilson (gmwils@gmail.com)
