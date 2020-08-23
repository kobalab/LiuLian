/*
 *  liulian
 */
"use strict";

const Request = require('./http/request');
const HTML = require('./html');

class LiuLian {

    constructor(locale) {
        this._locale = locale;
    }

    handle(req, res, next) {
        const html = new HTML(new Request(this, req));
        res.send(html.echo());
    }
}

module.exports = function(locale) {
    const liulian = new LiuLian(locale);
    return (req, res, next)=>liulian.handle(req, res, next);
}
