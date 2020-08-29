/*
 *  http/request
 */
"use strict";

const { join, isAbsolute, dirname } = require('path').posix;

function extUrl(url) {
    return url.match(/^(?:\w+:)?\/\//) ? true : false;
}

module.exports = class Request {

    constructor(liulian, req) {
        this._liulian = liulian;
        this._req = req;
        this.msg = liulian._.locale(req.acceptsLanguages());
    }

    method()    { return this._req.method }
    scheme()    { return this._liulian._mount ? this._liulian._mount.scheme
                                              : this._req.protocol }
    host()      { return this._liulian._mount ? this._liulian._mount.host
                                              : this._req.headers.host }
    url()       { return this._liulian._mount
                                    ? this.baseUrl() + this._req.url
                                    : this._req.originalUrl }
    baseUrl()   { return this._liulian._mount ? this._liulian._mount.base
                                              : this._req.baseUrl }
    path()      { return this._req.path }
    query()     { return (this._req.url.match(/(?<=\?).*/)||[])[0] }

    remote()    { return this._req.ip }

    params(key) { return key ? [].concat(this._req.query[key])
                             : Object.keys(this._req.query) }
    param(key)  { return key ? this.params(key)[0]
                             : this.params() }

    header(key) { return key ? this._req.header(key)
                             : Object.keys(this._req.headers) }

    fixpath(path) { return path.match(/^\/(?!\/)/)
                            ? this.baseUrl() + path
                            : path }
    fullUrl(path) {
        const base = this.scheme() + '://' + this.host() + this.baseUrl();
        return extUrl(path) ? (path.match(/^\//) ? this.scheme() + ':' + path
                                                 : path)
             : isAbsolute(path) ? base + path
             :                    base + join(dirname(this.path()), path);
    }

    sessionID() { return this._req.sessionID }
}
