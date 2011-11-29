var http = require('http');
var multi = require('multiparter');
var crypto = require('crypto');
var datejs = require('datejs');

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
    
    this.send = function(params, success_cb, failure_cb) {
        var expires_date = new Date().add({ days: 1 });

        if (!params.auth) { params.auth = {}; }
        if (!params.auth.key) { params.auth.key = this.authKey; }
        params.auth.expires = expires_date.toISOString();

        var req = new multi.request(http, this.apiOptions);
        var json_params = JSON.stringify(params);
        var hmac = crypto.createHmac('sha1', this.authSecret);
        hmac.update(json_params);
        var signature = hmac.digest('hex');

        req.setParam("params", json_params);
        req.setParam("signature", signature);
        
        req.send(function(err, res) {
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