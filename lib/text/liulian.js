/*
 *  text/liulian
 */
"use strict";

const inline = require('./inline');
const { cdata, strip } = require('../util/html-escape');
const hljs = require('highlight.js');
const Module = require('../module');

const module_re = /^#\w+(?:\(.*?\))?(?:<<\S+)?$/;

class LiuLian {

    constructor(r) {
        this._r     = r;
        this._eod = [];
        this._lines = []
        this._ = {
            title: '',
            toc:  [],
            note: [],
            notebase: 0,
        };
        this._module = new Module(this);
    }

    insertText(text, head) {
        let lines = [];
        for (let line of text.replace(/\r?\n$/,'').split(/\r?\n/)) {
            lines.push(line);
        }
        if (head) this._lines = lines.concat(this._lines);
        else      this._lines = this._lines.concat(lines);
    }

    get eod() {
        if (! this._lines.length) return true;
        if (this._lines[0] == this._eod[0]) return true;
        return false;
    }
    set eod(mark) { this._eod.unshift(mark) }
    reset(mark) {
        if (mark && this.eod && this._eod[0] == mark) {
            this._eod.shift();
            this._lines.shift();
        }
    }

    nextline(npb) {
        if (this.eod) return;
        if (npb) return this._lines[0];
        let line = '';
        for (let l of this._lines) {
            line += l;
            if (line.substr(-1) != '\\') break;
            line = line.replace(/\\$/,'');
        }
        return line;
    }
    readline(npb) {
        if (this.eod) return;
        if (npb) return this._lines.shift();
        let line = this._lines.shift();
        while (line.substr(-1) == '\\') {
            line = line.replace(/\\$/,'');
            line += this._lines.shift();
        }
        return line;
    }

    get(key) { return this._[key] }
    noteref(note) {
        this._.note.push(note);
        return this._.notebase ? this._.notebase + '.' + this._.note.length
                               : '.' + this._.note.length;
    }
    nextNote() {
        this._.note = [];
        this._.notebase++;
    }

    async parse() {
        this.insertText(this._r.text);
        return await this.block() + this.footnote();
    }

    npBlock(eod) {
        this.eod = eod;
        let text = '';
        while (! this.eod) {
            let line = this.readline(1);
            text += line + '\n';
        }
        this.reset(eod);
        return text;
    }

    async block(eod) {
        if (eod) this.eod = eod;
        let html = '';
        while (! this.eod) {
            let line = this.nextline();

            if      (! line)                  this.readline();
            else if (line.match(/^\!/))       html += this.title();
            else if (line.match(/^\*/))       html += this.h();
            else if (line.match(/^\-+$/))     html += this.hr();
            else if (line.match(/^[\-\+]/))   html += this.li();
            else if (line.match(/^\:/))       html += this.dl();
            else if (line.match(/^\|/))       html += this.table();
            else if (line.match(/^\s/))       html += this.pre();
            else if (line.match(/^>\|\w*$/))  html += this.blockPre();
            else if (line.match(/^>\|\|$/))   html += this.softPre();
            else if (line.match(/^>>$/))      html += await this.blockquote();
            else if (line.match(/^\/[\/\*]/)) html += this.comment();
            else if (line.match(module_re))   html += await this.blockModule();
            else                              html += this.p();
        }
        this.reset(eod);
        return html;
    }

    line(line) {
        let eol = line.substr(-1) == '~' ? '<br>\n' : '\n';
        return this.inline(line.replace(/^\\/,'').replace(/~$/,'')) + eol;
    }

    p() {
        let line = this.nextline();
        let align = line[0] == '<' ? 'left'
                  : line[0] == '=' ? 'center'
                  : line[0] == '>' ? 'right'
                  :                  '';
        let html = align ? `<p style="text-align: ${align}">` : '<p>';

        for (;;) {
            html += this.line(this.readline().replace(/^[~<=>]/,''));

            line = this.nextline();
            if (! line || line.match(/^[\!\*\-\+\:\|\s\<\=\>\~]/)) break;
            if (line.match(/^\/[\/\*]/)) break;
            if (line.match(module_re)) break;
        }
        return html.replace(/\n$/,'') + '</p>\n\n';
    }

    title() {
        let line = this.readline().replace(/^\!\s*/,'');
        this._.title = strip(this.inline(line));
        this._r.title(this._.title);
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
            html += '<li>'
                  + this.line(this.readline().replace(/^(?:\-+|\++)\s*/,''));
        }

        while (! this.eod) {
            line = this.nextline();
            if (! line || line.match(/^[\!\*\:\|\s\<\=\>\~]/)) break;
            if (line.match(/^-+$/)) break;
            if (line.match(/^\/[\/\*]/)) break;
            if (line.match(module_re)) break;

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
            html += this.line(this.readline().replace(/^(?:\-+|\++)\s*/,''));
        }
        html = html.replace(/\n$/,'') + `</li>\n</${uo}>\n`;
        return level == 1 ? html + '\n' : html;
    }

    dl() {
        let html = '<dl>\n';
        for (;;) {
            let line = this.readline().replace(/^:/,'');
            if (line) html += `<dt>${this.inline(line)}</dt>\n`;

            line = this.nextline();
            if (! line || line.match(/^[\!\*\-\+\|\s\<\=\>\~]/)) break;
            if (line.match(/^\/[\/\*]/)) break;
            if (line.match(module_re)) break;
            if (line.match(/^\:/)) continue;

            html += '<dd>';
            while (! this.eod) {
                html += this.line(this.readline());

                line = this.nextline();
                if (! line || line.match(/^[\!\*\-\+\:\|\s\<\=\>\~]/)) break;
                if (line.match(/^\/[\/\*]/)) break;
                if (line.match(module_re)) break;
            }
            html = html.replace(/\n$/,'') + '</dd>\n';
            if (! line || ! line.match(/^\:/)) break;
        }
        return html + '</dl>\n\n';
    }

    table() {
        let cell = [];
        for (;;) {
            let line = this.readline().replace(/\|$/,'');
            let cols = line.match(/\|(?:\[\[.*?\]\]|[^\|])*/g) || [];
            cell.push(cols.map(c=>c.replace(/^\|/,'')));
            line = this.nextline();
            if (! line || ! line.match(/^\|/)) break;
        }

        let html = '<table>\n';
        for (let y = 0; y < cell.length; y++) {
            html += '<tr>';
            for (let x = 0; x < cell[y].length; x++) {

                if (cell[y][x].match(/^[\-\^]/)) continue;

                let colspan = 1;
                for (let i = 1; x + i < cell[y].length; i++) {
                    if (cell[y][x + i] && cell[y][x + i][0] == '-') colspan++;
                    else break;
                }
                colspan = colspan > 1 ? ` colspan="${colspan}"` : '';
                let rowspan = 1;
                for (let i = 1; y + i < cell.length; i++) {
                    if (cell[y + i][x] && cell[y + i][x][0] == '^') rowspan++;
                    else break;
                }
                rowspan = rowspan > 1 ? ` rowspan="${rowspan}"` : '';

                let text = cell[y][x];

                let hd = text[0] == '~' ? 'th' : 'td';
                text = text.replace(/^~/,'');

                let style = [];

                let align = text[0] == '<' ? 'left'
                          : text[0] == '=' ? 'center'
                          : text[0] == '>' ? 'right'
                          :                  '';
                if (align) style.push('text-align:' + align);
                text = text.replace(/^[<=>]/,'');

                let cls = (text.match(/^(?:\.[\w\-]+)+/)||[])[0];
                text = text.replace(/^(?:\.[\w\-]+)+/,'');
                cls = cls
                    ? ` class="${cls.replace(/^\./,'').replace(/\./g,' ')}"`
                    : '';

                let color = (text.match(/^#[0-9a-f]+/i)||[])[0];
                if (color) style.push('background:' + color);
                text = text.replace(/^#[0-9a-f]+/i,'');

                if (style.length) style = ` style="${cdata(style.join(';'))}"`;

                html += '<' + hd + colspan + rowspan + cls + style + '>'
                      + this.inline(text) + '</' + hd + '>';
            }
            html += '</tr>\n';
        }
        return html + '</table>\n\n';
    }

    pre() {
        let html = '<pre>';
        for (;;) {
            html += cdata(this.readline(1).replace(/^\ /,'')) + '\n';

            let line = this.nextline(1);
            if (! line || ! line.match(/^\s/)) break;
        }
        return html.replace(/\n$/,'') + '</pre>\n\n';
    }

    blockPre() {
        const lang = this.readline().match(/^>\|(.*)$/)[1];
        const code = this.npBlock('|<').replace(/\n$/,'');
        const error = console.error; console.error = ()=>{};
        let html = '<pre>';
        if (lang) {
            try {
                html += '<code>'
                     + hljs.highlight(lang, code).value
                     + '</code>'
            }
            catch(e) {
                html += '<code>'
                     + hljs.highlightAuto(code).value
                     + '</code>'
            }
        }
        else {
            html += cdata(code);
        }
        console.error = error;
        return html + '</pre>\n\n';
    }

    softPre() {
        this.readline();
        let html = '<pre>';
        while (! this.eod) {
            let line = this.readline(1);
            if (line == '||<') break;
            html += this.inline(line) + '\n';
        }
        return html.replace(/\n$/,'') + '</pre>\n\n';
    }

    async blockquote() {
        this.readline();
        let html = '<blockquote>\n'
                 + (await this.block('<<')).replace(/\n$/,'')
                 + '</blockquote>\n\n';
        return html;
    }

    comment() {
        let line = this.readline();
        if (line.match(/^\/\//)) {
            if (line.match(/^\/\/\-/))
                 return `<!-- ${cdata(line.replace(/^\/\/\-\s*/,''))} -->\n`;
            else return '';
        }
        else {
            if (line.match(/^\/\*\*/)) {
                return '<!-- ' + line.replace(/^\/\*\*\s*/,'') + '\n'
                        + this.npBlock('*/') + '-->\n\n';
            }
            else {
                this.npBlock('*/');
                return '';
            }
        }
    }

    footnote() {
        if (! this._.note.length) return '';

        let html = '<div class="l-footnote">\n<ol>\n';
        let base = this._.notebase ? this._.notebase : '';
        for (let i = 0; i < this._.note.length; i++) {
            html += `<li><a id="l-footnote${base}.${i+1}" `
                  + `href="#l-noteref${base}.${i+1}">`
                  + '^</a> ' + this._.note[i] + '</li>\n';
        }
        html += '</ol>\n</div>\n\n';
        return html;
    }

    async blockModule() {
        let line = this.readline();
        let [ , name, param, eod ]
                = line.match(/^#(\w+)(?:\((.*?)\))?(?:<<(\S+))?$/);
        if (name == '_') return await this.tag(line, param, eod);
        if (name == 'import') return this.import(line, param);

        return await this._module.callBlockModule(line, name, param, eod);
    }

    async tag(line, param, eod) {
        if (! param.match(/^\w+(?:\s+\w+(?:="[^>]*?")?)*$/))
            return '<div style="color:red">' + cdata(line) + '</div>\n\n';

        let tag = param.replace(/\s.*$/,'');
        if (eod) {
            return `<${param}>\n`
                 + ( tag.match(/^style|script$/i)
                                ? this.npBlock(eod)
                                : (await this.block(eod)).replace(/\n$/,'') )
                 + `</${tag}>\n\n`;
        }
        else {
            return `<${param}>\n\n`;
        }
    }

    import(line, param) {
        if (this._module.import(param)) return '';
        return '<div style="color:red">' + cdata(line) + '</div>\n\n';
    }

    inlineModule(str, name, param, value) {
        return this._module.callInlineModule(str, name, param, value);
    }
}

module.exports = async function(r) {
    const parser = new LiuLian(r);
    parser.inline = inline(parser);
    return await parser.parse();
}
