/*
 *  html
 */
"use strict";

module.exports = class HTML {

    constructor() {
        this._ = {
            lang:   'ja',
            title:  'LiuLian',
        };
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
             + `<title>${this.title()}</title>\n`
             + '</head>\n';
    }

    stringify(content) {
        return '<!DOCTYPE html>\n'
             + `<html lang="${this.lang()}">\n`
             + this._head()
             + '<body>\n'
             + content
             + '</body>\n'
             + '</html>\n';
    }
}
