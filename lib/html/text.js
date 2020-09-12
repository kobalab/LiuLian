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

        return '<form id="l-udtext" method="POST" '
                    + `action="${cdata(req.fixpath(req.path))}">\n`
             + '<input type="hidden" name="session_id" '
                    + `value="${cdata(req.sessionID)}" >\n`
             + `<textarea name="text">${cdata(this._r.text)}</textarea>\n`
             + `<input type="submit" value="${cdata(msg('udtext.submit'))}">\n`
             + '</form>\n';
    }
}
