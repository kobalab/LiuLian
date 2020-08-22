/*
 *  util/locale.js
 */
"use strict";

const msg  = require('./msg');
const path = require('path');
const fs   = require('fs');

class Locale {
    constructor(dirname, _default) {
        this._ = {};
        this._lang = [];
        for (let lang of fs.readdirSync(dirname).sort()) {
            this._[lang.toLowerCase().replace(/_/g,'-')]
                = msg(path.join(dirname, lang));
            if (lang == _default) this._lang.unshift(lang);
            else                  this._lang.push(lang);
        }
        this._default = this._[_default];
    }
    lang(lang) {
        if (! lang) return this._lang;
        else if (typeof lang == 'string')
                    return this._[lang.toLowerCase()]
                        || this._[lang.toLowerCase().replace(/\-.*/,'')]
                        || this._default;
        else {
            for (let l of lang) {
                l = l.toLowerCase();
                if (this._[l]) return this._[l];
                l = l.replace(/\-.*/,'');
                if (this._[l]) return this._[l];
            }
            return this._default;
        }
    }
}

module.exports = function(dirname, _default) {
    const locale = new Locale(dirname, _default);
    return (lang)=>locale.lang(lang);
}
