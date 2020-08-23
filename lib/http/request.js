/*
 *  http/request
 */
"use strict";

module.exports = class Request {

    constructor(liulian, req) {
        this._liulian = liulian;
        this._req = req;
        this.msg = liulian._locale(req.acceptsLanguages());
    }
}
