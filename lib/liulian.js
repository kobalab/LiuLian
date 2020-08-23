/*
 *  liulian.js
 */
"use strict";

class LiuLian {

    constructor(locale) {
        this._locale = locale;
    }

    handle(req, res, next) {
        let greeting = this._locale(req.acceptsLanguages())('greeting');
        res.send(`<h1>${greeting}</h1>`);
    }
}

module.exports = function(locale) {
    const liulian = new LiuLian(locale);
    return (req, res, next)=>liulian.handle(req, res, next);
}
