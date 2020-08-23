/*
 *  html
 */
"use strict";

const { cdata, cref } = require('../util/html-escape');

module.exports = class HTML {

    constructor(req) {
        this._req = req;
        this._ = {
            lang:   req.msg('Lang'),
            title:  'LiuLian',
        };
        this.msg = req.msg;
    }

    lang(lang) {
        if (lang) this._.lang = lang;
        else      return this._.lang;
        return this;
    }

    title(title) {
        if (title) this._.title = title;
        else      return this._.title;
        return this;
    }

    _head() {
        return '<head>\n'
             + '<meta charset="utf-8">\n'
             + `<title>${cref(this.title())}</title>\n`
             + '</head>\n';
    }

    stringify(content = '') {
        return '<!DOCTYPE html>\n'
             + `<html lang="${cdata(this.lang())}">\n`
             + this._head()
             + '<body>\n'
             + content
             + '</body>\n'
             + '</html>\n';
    }

    greeting() {
        return this.stringify(`<h1>${cref(this.msg('greeting'))}</h1>\n`);
    }
}
