/*
 *  html/file
 */
"use strict";

const { cdata, fixpath } = require('../util/html-escape');

const HTML = require('./');

function timeStr(time) {

    const now  = new Date().getTime();

    const date = new Date(time);
    const year = date.getFullYear();
    const m    = date.getMonth() + 1;
    const mm   = ('0' + m).substr(-2);
    const d    = date.getDate();
    const dd   = ('0' + d).substr(-2);
    const hour = ('0' + date.getHours()).substr(-2);
    const min  = ('0' + date.getMinutes()).substr(-2);

    if      (now - time < 1000*60*60*12)    return `${hour}:${min}`;
    else if (now - time < 1000*60*60*24*365/2)
                                            return `${m}/${d} ${hour}:${min}`;
    else                                    return `${year}/${mm}/${dd} `;
}

module.exports = class File extends HTML {

    constructor(r) {
        super(r._req);
        this._r = r;
    }

    _editmenu() {
        let path = fixpath(this._r.location, this._req.baseUrl);
        return '<li><a href="'
                        + cdata(path)
                            + (this._req.cmd == 'edit' ? '' : '?cmd=edit')
                    + '" accesskey="e">'
                    + cdata(this.msg('toolbar.edit'))
                    + `</a></li>\n`;
    }

    _logmenu() {
        if (! this._r._backup) return ''
        let path = fixpath(this._r.location, this._req.baseUrl);
        return '<li><a href="'
                        + cdata(path)
                            + (this._req.cmd == 'log' ? '' : '?cmd=log')
                    + '">'
                    + cdata(this.msg('toolbar.log'))
                    + `</a></li>\n`;
    }

    _title() {
        const req = this._req;
        const msg = req.msg;

        let title = this._r.name;
        if (req.cmd == 'log') title = msg('log.title', title);

        this.title(title);
        return `<h1 id="l-title"><a href="${cdata(this._r.name)}">`
                    + `${cdata(title)}</a></h1>\n`;
    }

    _path() {
        const req   = this._req;
        const query = req.cmd ? '?cmd=' + cdata(req.cmd) :'';
        let html = '';
        let dirs = ['LiuLian:'].concat(req.pathDir.split(/\//).filter(d=>d));
        let path = '/';
        for (let dir of dirs) {
            if (html) {
                path += dir + '/';
            }
            dir = decodeURIComponent(dir);
            html += `<a href="${cdata(fixpath(path, req.baseUrl) + query)}">`
                        + `${cdata(dir)}</a> / `;
        }
        return '<div id="l-path">' + html + '</div>\n';
    }

    _form() {

        if (this._req.cmd != 'edit') return ''

        const req = this._req;
        const msg = req.msg;

        return '<form id="l-udfile" method="POST" '
                    + 'enctype="multipart/form-data">\n'
             + '<fieldset>'
             + `<legend>${cdata(msg('udfile.label'))}</legend>\n`
             + '<input type="hidden" name="session_id" '
                    + `value="${cdata(req.sessionID)}" >\n`
             + '<input type="file" name="file">\n'
             + '<span>\n'
             + '<img src="'
                + cdata(fixpath('/css/icon-upload-alt.png', req.baseUrl))
                + '">\n'
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

    _log() {

        const msg = this._req.msg;

        let html = '<table id="l-log">\n';
        html += '<tr>'
              + `<th>${cdata(msg('log.time'))}</th>`
              + (this._r.text != null
                   ? `<th colspan="2">${cdata(msg('log.diff'))}</th>`
                   : '')
              + '<th></th>'
              + (this._r.text != null ? '<th></th>' : '')
              + '</tr>\n'

        for (let i = 0; i < this._r.log.length; i++) {

            let log  = this._r.log[i];
            let log2 = this._r.log[i + 1];

            html += '<tr>'
                  + `<td class="l-time">${timeStr(log.time)}</td>`
                  + (this._r.text != null
                      ? ((log2 ? (
                          '<td class="l-diff">'
                            + `<a href="${cdata(
                                `?cmd=diff&rev=${log2.rev}&rev=${log.rev}`)}">`
                            + `${cdata(msg('log.prev'))}</a></td>`
                          ) : '<td></td>')
                          + '<td class="l-diff">'
                            + `<a href="${cdata(`?cmd=diff&rev=${log.rev}`)}">`
                            + `${cdata(msg('log.curr'))}</a></td>`)
                      : '')
                  + `<td><a href="?rev=${log.rev}">`
                        + `${cdata(msg('log.show'))}</a></td>`
                  + (this._r.text != null
                      ? `<td><a href="?cmd=edit&rev=${log.rev}">`
                            + `${cdata(msg('log.edit'))}</a></td>`
                      : '')
                  + '</tr>\n';
        }

        return html += '</table>\n';
    }

    edit() {
        return this.stringify(
              this._title()
            + this._path()
            + this._form()
        );
    }

    log() {
        return this.stringify(
              this._title()
            + this._log()
        );
    }
}
