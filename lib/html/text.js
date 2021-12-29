/*
 *  html/file
 */
"use strict";

const { cdata } = require('../util/html-escape');

const File = require('./file');

module.exports = class Text extends File {

    _form() {
        const req = this._req;
        const msg = req.msg;

        return '<form id="l-udtext" method="POST">\n'
             + '<input type="hidden" name="session_id" '
                    + `value="${cdata(req.sessionID)}" >\n`
             + `<textarea name="text">${cdata(this._r.text)}</textarea>\n`
             + `<input type="submit" value="${cdata(msg('udtext.submit'))}">\n`
             + '</form>\n';
    }

    _diff() {

        if (! this._r.diff.length) return '';

        let html = '<div id="l-diff">\n';

        for (let line of this._r.diff) {

            if (! line.length)   continue;
            if (line[0] == '\\') continue;

            html += line[0] == '@'
                        ? `<span class="l-head">${cdata(line)}</span>\n`
                  : line[0] == '+'
                        ? `<ins>${cdata(line.substr(1))}</ins>\n`
                  : line[0] == '-'
                        ? `<del>${cdata(line.substr(1))}</del>\n`
                  :       `<span>${cdata(line.substr(1))}</span>\n`;
        }

        return html += '</div>\n';
    }

    diff() {
        return this.stringify(
              this._title()
            + this._diff()
        );
    }
}
