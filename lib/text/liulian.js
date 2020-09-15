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

    get eod()  { return ! this._lines.length }
    readline() { return ! this.eod && this._lines.shift() }
    nextline() { return ! this.eod && this._lines[0]      }

    parse() {
        return this.block();
    }

    block() {
        let html = '';
        while (! this.eod) {
            let line = this.nextline();

            if      (! line)            this.readline();
            else if (line.match(/^~/))  html += this.p();
            else                        html += this.p();
        }
        return html;
    }

    p() {
        let html = '<p>';
        while (! this.eod) {
            let line = this.readline();
            let eol = line.substr(-1) == '~' ? '<br>\n' : '\n';
            html += this.inline(line.replace(/^~/,'')
                                    .replace(/~$/,'')) + eol;
            line = this.nextline();
            if (! line) break;
            if (line.match(/^~/)) break;
        }
        return html.replace(/\n$/,'') + '</p>\n\n';
    }
}

module.exports = function(r) {
    const parser = new LiuLian(r);
    parser.inline = inline();
    return parser.parse();
}
