/*
 *  text/liulian
 */
"use strict";

const inline = require('./inline');
const { cdata, strip } = require('../util/html-escape');

class LiuLian {

    constructor(r) {
        this._r     = r;
        this._lines = r.text.replace(/\r?\n$/,'').split(/\r?\n/);
        this._ = {
            toc: []
        };
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
            else if (line.match(/^[\-\+]/)) html += this.li();
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
            if (line.match(/^[\!\*\-\+\~]/)) break;
        }
        return html.replace(/\n$/,'') + '</p>\n\n';
    }

    title() {
        let line = this.readline().replace(/^\!\s*/,'');
        this._r.title(strip(this.inline(line)));
        return '<h1>' + this.inline(line) +'</h1>\n\n';
    }

    h() {
        let line = this.readline();

        let l = line.match(/^\*{1,5}/)[0].length + 1;
        line = line.replace(/^\*+\s*/,'');

        let id = (line.match(/\[([^\[\]]*)\]$/)||[])[1]
                    || 'l-sec.' + (this._.toc.length + 1);
        line = line.replace(/\s*\[[^\[\]]*\]$/,'');

        let toc = '-'.repeat(l - 1) + '[[' + strip(this.inline(line))
                    + '|#' + id + ']]';
        this._.toc.push(toc);

        return `<h${l} id="${cdata(id)}">`
                + this.inline(line)
                + `</h${l}>\n\n`;
    }

    hr() {
        let line = this.readline();
        return '<hr>\n\n';
    }

    li(level = 1) {
        let line = this.nextline();
        let uo = line[0] == '-' ? 'ul' : 'ol';
        let html = `<${uo}>\n`;
        let l = line.match(/^(?:\-+|\++)/)[0].length;
        if (level < l) {
            html += '<li style="display: inline; list-style-type: none;">\n'
                  + this.li(level + 1);
        }
        else {
            html += '<li>';
            line = this.readline().replace(/^(?:\-+|\++)\s*/,'');
            let eol = line.substr(-1) == '~' ? '<br>\n' : '\n';
            html += this.inline(line.replace(/\~$/,'')) + eol;
        }

        while (! this.eod) {
            line = this.nextline();
            if (! line) break;
            if (line.match(/^[\!\*\~]/)) break;

            let l = (line.match(/^(?:\-+|\++)/)||[''])[0].length;
            if (l) {
                if (l < level) break;
                if (level < l) {
                    html += this.li(level + 1);
                    continue;
                }
                if (uo == 'ul' && line[0] == '+') break;
                if (uo == 'ol' && line[0] == '-') break;
                html = html.replace(/\n$/, '') + '</li>\n<li>';
            }
            line = this.readline().replace(/^(?:\-+|\++)\s*/,'');
            let eol = line.substr(-1) == '~' ? '<br>\n' : '\n';
            html += this.inline(line.replace(/\~$/,'')) + eol;
        }
        html = html.replace(/\n$/,'') + `</li>\n</${uo}>\n`;
        return level == 1 ? html + '\n' : html;
    }
}

module.exports = function(r) {
    const parser = new LiuLian(r);
    parser.inline = inline();
    return parser.parse();
}
