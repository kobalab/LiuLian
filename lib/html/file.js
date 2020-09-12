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
        const query = req.cmd ? '?cmd=' + cdata(req.cmd) :'';
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

        if (this._req.cmd != 'edit') return ''

        const req = this._req;
        const msg = req.msg;

        return '<form id="l-udfile" method="POST" '
                    + 'enctype="multipart/form-data" '
                    + `action="${cdata(req.fixpath(req.path))}">\n`
             + '<fieldset>'
             + `<legend>${cdata(msg('udfile.label'))}</legend>\n`
             + '<input type="hidden" name="session_id" '
                    + `value="${cdata(req.sessionID)}" >\n`
             + '<input type="file" name="file">\n'
             + '<span>\n'
             + `<img src="${cdata(req.fixpath('/css/icon-upload-alt.png'))}">\n`
             + '<input type="text" name="filename" disabled>\n'
             + '</span>\n'
             + `<input type="submit" value="${cdata(msg('udfile.submit'))}">\n`
             + '</fieldset>\n'
             + '</form>\n'
             + '<script>\n'
                 + 'var file = document.querySelector('
                        + '\'#l-udfile input[name="file"]\');\n'
                 + 'var filename = document.querySelector('
                        + '\'#l-udfile input[name="filename"]\');\n'
                 + 'var span = document.querySelector(\'#l-udfile span\');\n'
                 + 'var img = document.querySelector(\'#l-udfile img\');\n'
                 + 'file.onchange = function(event){\n'
                 + '\tif (event.target.files.length) {\n'
                 + '\t\tfilename.value = event.target.files[0].name;\n'
                 + '\t\timg.classList.add(\'l-enable\')\n'
                 + '\t}\n'
                 + '}\n'
                 + 'span.onclick = function(){\n'
                 + '\tfile.value = \'\';\n'
                 + '\tfilename.value = \'\';\n'
                 + '\tfile.click();\n'
                 + '\timg.classList.remove(\'l-enable\')\n'
                 + '}\n'
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
