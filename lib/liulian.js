/*
 *  liulian
 */
"use strict";

const Request = require('./http/request');
const Response = require('./http/response');

class LiuLian {

    constructor(config) {
        this._ = config;
        if (config.mount) {
            const [ mount, scheme, host, base ]
                        = config.mount.match(/^(.*?):\/\/([^\/]*)(.*?)\/?$/);
            this._mount = {
                scheme: scheme,
                host:   host,
                base:   base
            };
        }
    }
}

function redirectRoot(req, res) {

    if (req.path == '' || req.path == '/'
                       && req.url.replace(/\?.*$/,'').substr(-1) != '/')
    {
        const query = req.query;
        res.redirect(301, '/' + (query ? '?' + query : ''));
        return true;
    }
    return false;
}

function get(req, res) {

    if (redirectRoot(req, res)) return;

    if (req.path == '/LOGIN') {
        if      (req.query == 'SUCESS') res.redirect(303, '/');
        else if (req.query == 'ERROR')  res.error(401);
        else                            res.login();
        return;
    }

    res.send();
}

module.exports = function(config) {

    const liulian = new LiuLian(config);

    return function(req, res, next) {
        const _req = new Request(liulian, req);
        const _res = new Response(_req, res);

        if      (_req.method == 'GET')  get(_req, _res);
        else if (_req.method == 'HEAD') get(_req, _res);
        else                            _res.error(405);
    };
}
