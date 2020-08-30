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

    get method()    { return this._req.method }
    get scheme()    { return this._liulian._mount ? this._liulian._mount.scheme
                                                  : this._req.protocol }
    get host()      { return this._liulian._mount ? this._liulian._mount.host
                                                  : this._req.headers.host }
    get url()       { return this._liulian._mount ? this.baseUrl + this._req.url
                                                  : this._req.originalUrl }
    get baseUrl()   { return this._liulian._mount ? this._liulian._mount.base
                                                  : this._req.baseUrl }
    get path()      { return this._req.path }
    get query()     { return (this._req.url.match(/(?<=\?).*/)||[])[0] }
    get remote()    { return this._req.ip }
    get sessionID() { return this._req.sessionID }
    get user()      { return this._req.user }

    params(key) { return key ? [].concat(this._req.query[key])
                             : Object.keys(this._req.query) }
    param(key)  { return key ? this.params(key)[0]
                             : this.params() }

    header(key) { return key ? this._req.header(key)
                             : Object.keys(this._req.headers) }

    fixpath(path) { return path.match(/^\/(?!\/)/) ? this.baseUrl + path
                                                   : path }
    fullUrl(path) {
        const base = this.scheme + '://' + this.host + this.baseUrl;
        return extUrl(path) ? (path.match(/^\//) ? this.scheme + ':' + path
                                                 : path)
             : isAbsolute(path) ? base + path
             :                    base + join(dirname(this.path), path);
    }
}
