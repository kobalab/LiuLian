/*
 *  liulian
 */
"use strict";

const HTML = require('./html');

class LiuLian {

    constructor(locale) {
        this._locale = locale;
    }

    handle(req, res, next) {
        let greeting = this._locale(req.acceptsLanguages())('greeting');
        let html = new HTML();
        res.send(html.stringify(`<h1>${greeting}</h1>`));
    }
}

module.exports = function(locale) {
    const liulian = new LiuLian(locale);
    return (req, res, next)=>liulian.handle(req, res, next);
}
