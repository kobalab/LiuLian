/*
 *  liulian
 */
"use strict";

const Request = require('./http/request');
const HTML = require('./html');

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

    handle(req, res, next) {
        const html = new HTML(new Request(this, req));
        res.send(html.echo());
    }
}

module.exports = function(config) {
    const liulian = new LiuLian(config);
    return (req, res, next)=>liulian.handle(req, res, next);
}
