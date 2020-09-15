/*
 *  text/liulian
 */
"use strict";

const inline = require('./inline');

class LiuLian {

    constructor(r) {
        this._r     = r;
        this._lines = r.text.replace(/\r?\n$/,'').split(/\r?\n/);
    }

    get eod()      { return ! this._lines.length }
    get readline() { return ! this.eod && this._lines.shift() + '\n' }

    parse() {
        let html = '';
        while (! this.eod) {
            let line = this.readline;
            html += this.inline(line) + '\n';
        }
        return html;
    }
}

module.exports = function(r) {
    const parser = new LiuLian(r);
    parser.inline = inline();
    return parser.parse();
}
