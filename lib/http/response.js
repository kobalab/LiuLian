/*
 *  http/response
 */
"use strict";

const HTML = require('../html');

module.exports = class Response {

    constructor(req, res) {
        this._req = req;
        this._res = res;
    }

    send() {
        this._res.send(new HTML(this._req).echo());
    }
}
