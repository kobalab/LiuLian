/*
 *  html/file
 */
"use strict";

const { cdata } = require('../util/html-escape');

const HTML = require('./');

module.exports = class File extends HTML {

    constructor(r) {
        super(r._req);
        this._r = r;
    }

    _title() {
        this.title(this._r.name);
        return `<h1 id="l-title"><a href="${cdata(this._r.name)}">`
                    + `${cdata(this._r.name)}</a></h1>\n`;
    }

    _path() {
        const req   = this._req;
        const cmd   = req.param('cmd');
        const query = cmd ? '?cmd=' + cdata(cmd) :'';
        let html = '';
        let dirs = ['LiuLian:'].concat(req.path.replace(/\/[^\/]*$/,'')
                                               .split(/\//).filter(d=>d));
        let path = '/';
        for (let dir of dirs) {
            if (html) {
                path += dir + '/';
            }
            dir = decodeURIComponent(dir);
            html += `<a href="${cdata(req.fixpath(path) + query)}">`
                        + `${cdata(dir)}</a> / `;
        }
        return '<div id="l-path">' + html + '</div>\n';
    }

    _form() {

        if (this._req.param('cmd') != 'edit') return ''

        const req = this._req;
        const msg = req.msg;

        return '<form id="l-udfile" method="POST" '
                    + 'enctype="multipart/form-data" '
                    + `action="${cdata(req.fixpath(req.path))}">\n`
             + '<input type="hidden" name="cmd" value="debug">\n'
             + '<fieldset>'
             + `<legend>${cdata(msg('udfile.label'))}</legend>\n`
             + '<input type="hidden" name="session_id" '
                    + `value="${cdata(req.sessionID)}" >\n`
             + '<label><img src="'
                    + cdata(req.fixpath('/css/icon-upload-alt.png'))
                    + '"><input type="file" name="file"></label>\n'
                    + '<input type="text" name="filename" disabled>\n'
             + `<input type="submit" value="${cdata(msg('udfile.submit'))}">\n`
             + '</fieldset>\n'
             + '</form>\n'
             + '<script>'
                + 'document.querySelector(\'#l-udfile input[name="file"]\')'
                + '.onchange = function(event) { '
                + 'if (event.target.files.length) {'
                + 'document.querySelector(\'#l-udfile input[name="filename"]\')'
                + '.value = event.target.files[0].name;'
                + 'document.querySelector(\'#l-udfile img\')'
                + '.classList.add(\'l-enable\')'
                + '} else { '
                + 'document.querySelector(\'#l-udfile input[name="filename"]\')'
                + '.value = \'\';'
                + 'document.querySelector(\'#l-udfile img\')'
                + '.classList.remove(\'l-enable\')'
                + '} }'
             + '</script>\n';
    }

    edit() {
        return this.stringify(
              this._title()
            + this._path()
            + this._form()
        );
    }
}
