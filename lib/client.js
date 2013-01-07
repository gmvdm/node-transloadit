var http = require('http');
var multi = require('multiparter');
var crypto = require('crypto');
var _ = require('underscore');
var fs = require('fs');

var API_HOST = 'api2.transloadit.com';
var API_PATH = '/assemblies';

/**
 * Class Client
 *
 * @param {authKey} string Transloadit API key
 * @param {authSecret} string Transloadit API secret
 *
 * @return {Client} object
 */

var Client = module.exports = function(authKey, authSecret) {
    this.authKey = authKey;
    this.authSecret = authSecret;
    this.streams = {};
    this.apiOptions = {
        host: API_HOST,
        port: 80,
        path: API_PATH,
        method: 'POST'
    };

};

var methods = function() {
    /**
     * Public methods
     */
    this.addStream = function(name, file, type, size, stream) {
        stream.pause();
        this.streams[name] = {
            length: size,
            stream: stream,
            type: type,
            file: file
        };
    };

    this.addFile = function(file_name, file_path, mime_type) {
        var stat = fs.statSync(file_path);
        var stream = fs.createReadStream(file_path);
        var _mime_type = mime_type || 'application/octet-stream';

        this.addStream(file_name, file_name, _mime_type, stat.size, stream);
    };

    this.send = function(params, fields, success_cb, failure_cb) {
        if (_.isFunction(fields)){
            failure_cb = success_cb;
            success_cb = fields;
            fields = {};
        }

    	var expires_date = new Date();
		expires_date.setDate(expires_date.getDate()+1);

        if (!params.auth) { params.auth = {}; }
        if (!params.auth.key) { params.auth.key = this.authKey; }
        params.auth.expires = expires_date.toISOString();

        var req = new multi.request(http, this.apiOptions);
        var json_params = JSON.stringify(params);
        var hmac = crypto.createHmac('sha1', this.authSecret);
        hmac.update(json_params);
        var signature = hmac.digest('hex');

        req.setParam("params", json_params);
        for(var key in fields){
            if (_.isObject(fields[key]) || _.isArray(fields[key]))
                req.setParam(key, json.stringify(fields[key]));
            else
                req.setParam(key, fields[key]);
        }
        req.setParam("signature", signature);
        _.each(this.streams, function(value, key) {
            req.addStream(key, value.file, value.type, value.length, value.stream);
        });

        req.send(function(err, res) {
            if(err) return failure_cb(err);
            var body = '';
            res.on('data', function (chunk) {
                body += chunk;
            });

            res.on('end', function() {
                var result = JSON.parse(body);
                // console.log('Final data: ' + JSON.stringify(result));

                if (result.ok) {
                    if (success_cb) {
                        success_cb(result);
                    }
                } else {
                    if (failure_cb) {
                        failure_cb(result);
                    }
                }
            });
        });
    };
};

methods.call(Client.prototype);
