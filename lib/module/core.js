/*
 *  module/core
 */
"use strict";

const resource = require('../resource');
const { cdata } = require('../util/html-escape');

module.exports = class Core {

    constructor(parser) {
        this._parser = parser;
        this._r      = parser._r;
        this._inline = ['class'];
        this._block  = ['title','include','class'];
    }

    async title(type, param) {
        this._title = param;
        const value = await this._parser.block();
        this._r.title(this._title.replace(/\$\$/g, this._parser._.title));
        return value;
    }

    async include(type, param) {
        const err = `<div style="color:red">#include(${cdata(param)})</div>\n\n`;
        try {
            const r = await resource(this._parser._r._req, param);
            if (r.type != 'text/x-liulian') return err;
            await r.open();
            this._parser.insertText(r.text, true);
            return '';
        }
        catch(code) {
            return err;
        }
    }

    class(type, param, value) {
        if (type == '#') {
            return `<div class="${cdata(param)}">\n${value}</div>\n\n`;
        }
        else {
            return `<span class="${cdata(param)}">${value}</span>`;
        }
    }
}
