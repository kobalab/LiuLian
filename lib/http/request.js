/*
 *  http/request
 */
"use strict";

const { join, isAbsolute, dirname, basename } = require('path').posix;

function extUrl(url) {
    return url.match(/^(?:\w+:)?\/\//) ? true : false;
}

module.exports = class Request {

    constructor(liulian, req) {
        this._liulian = liulian;
        this._req = req;
        this.msg = liulian._.locale(req.acceptsLanguages());
    }

    get version()   { return this._liulian._version }
    get config()    { return this._liulian._ }
    get _mount()    { return this._liulian._mount }

    get method()    { return this._req.method }
    get scheme()    { return this._mount ? this._mount.scheme
                                         : this._req.protocol }
    get host()      { return this._mount ? this._mount.host
                                         : this._req.headers.host }
    get url()       { return this._mount ? this.baseUrl + this._req.url
                                         : this._req.originalUrl }
    get baseUrl()   { return this._mount ? this._mount.base
                                         : this._req.baseUrl }
    get path()      { return this._req.path }
    get query()     { return (this._req.url.match(/(?<=\?).*/)||[])[0] }
    get remote()    { return this._req.ip }
    get sessionID() { return this._req.sessionID }
    get user()      { return this._req.user }

    params(key) { return key ? this.method == 'GET'
                                    ? [].concat(this._req.query[key])
                                    : [].concat(this._req.body[key])
                             : this.method == 'GET'
                                    ? Object.keys(this._req.query)
                                    : Object.keys(this._req.body) }
    param(key)  { return key ? this.params(key)[0]
                             : this.params() }
    files(key)  { return key ? this._req.files[key]
                                    .map(f=>{ return {
                                                name: basename(f.originalname),
                                                path: f.path } })
                             : Object.keys(this._req.files) }

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
