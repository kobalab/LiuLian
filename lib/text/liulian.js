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

            if      (! line)                this.readline();
            else if (line.match(/^\!/))     html += this.title();
            else if (line.match(/^\*/))     html += this.h();
            else if (line.match(/^\-+$/))   html += this.hr();
            else if (line.match(/^\~/))     html += this.p();
            else                            html += this.p();
        }
        return html;
    }

    p() {
        let html = '<p>';
        while (! this.eod) {
            let line = this.readline();
            let eol = line.substr(-1) == '~' ? '<br>\n' : '\n';
            html += this.inline(line.replace(/^\~/,'')
                                    .replace(/\~$/,'')) + eol;
            line = this.nextline();
            if (! line) break;
            if (line.match(/^[\!\*\-\~]/)) break;
        }
        return html.replace(/\n$/,'') + '</p>\n\n';
    }

    title() {
        let line = this.readline().replace(/^\!\s*/,'');
        this._r.title(line);
        return '<h1>' + this.inline(line) +'</h1>\n\n';
    }

    h() {
        let line = this.readline();
        let l = line.match(/^\*{1,5}/)[0].length + 1;
        return `<h${l}>${line.replace(/^\*+\s*/,'').replace()}</h${l}>\n\n`;
    }

    hr() {
        let line = this.readline();
        return '<hr>\n\n';
    }
}

module.exports = function(r) {
    const parser = new LiuLian(r);
    parser.inline = inline();
    return parser.parse();
}
