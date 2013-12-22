var request = require('request');
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

var Client = module.exports = function(authKey, authSecret, apiOptions) {
    this.authKey = authKey;
    this.authSecret = authSecret;
    this.streams = {};
    this.apiOptions = apiOptions || {
        host: API_HOST,
        port: 80,
        path: API_PATH,
    };

};

var methods = function() {
    /**
     * Public methods
     */
    this.addStream = function(name, stream, _1, _2, _3) {
        if (_3) 
          stream = _3; // called by old form
        stream.pause();
        this.streams[name] = stream;
    };

    this.addFile = function(file_name, file_path) {
        var stream = fs.createReadStream(file_path);
        this.addStream(file_name, stream);
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

        var json_params = JSON.stringify(params);
        var hmac = crypto.createHmac('sha1', this.authSecret);
        hmac.update(json_params);
        var signature = hmac.digest('hex');

        var onResponse = function(err, res) {
            if (err) return failure_cb(err);

            try {
                var result = JSON.parse(res.body);
            } catch(e) {
                return failure_cb(e);
            }

            if (result && result.ok && success_cb)
                return success_cb(result);
            if (failure_cb)
                return failure_cb(result.error || "NOT OK");
        };

        var opts = this.apiOptions;
        var requestOptions = { uri: "http://" + opts.host + ":" + opts.port + opts.path };
        var req = request.post(requestOptions, onResponse);
        var form = req.form();
        form.append("params", json_params);
        for (var key in fields) {
            var val = (_.isObject(fields[key]) || _.isArray(fields[key]))
                ? json.stringify(fields[key])
                : fields[key];
            form.append(key, val);
        }
        form.append("signature", signature);
        _.each(this.streams, function(value, key) {
            form.append(key, value);
        });
    };
};

methods.call(Client.prototype);
