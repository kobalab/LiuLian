/*
 *  util/locale.js
 */
"use strict";

const msg  = require('./msg');
const path = require('path');
const fs   = require('fs');

class Locale {
    constructor(dirname, deflang) {
        this._ = {};
        for (let lang of fs.readdirSync(dirname).sort()) {
            if (lang[0] == '.') continue;
            this._[lang] = msg(path.join(dirname, lang));
        }
        this._default = deflang;
    }
    select(langs) {
        if (! langs) return [ this._default ]
                            .concat(Object.keys(this._)
                                    .filter(l=>l != this._default));
        const map = {};
        for (let lang of Object.keys(this._)) {
            map[lang.toLowerCase()] = lang;
        }
        let sellang = this._default;
        langs = typeof langs == 'string' ? [ langs ] : langs;
        for (let lang of langs) {
            lang = lang.toLowerCase();
            if (map[lang]) { sellang = map[lang]; break }
            lang = lang.replace(/\-.*/,'');
            if (map[lang]) { sellang = map[lang]; break }
        }
        const msg = this._[sellang];
        return function(...args) {
            if (! args.length) return sellang;
            else               return msg(...args);
        }
    }
}

module.exports = function(dirname, deflang) {
    const locale = new Locale(dirname, deflang);
    return (lang)=>locale.select(lang);
}
