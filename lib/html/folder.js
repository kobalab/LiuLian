/*
 *  html/folder
 */
"use strict";

const File = require('./file');
const { cdata, fixpath } = require('../util/html-escape');

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

function sizeStr(size) {

    if (size == null) return '-';

    let str;
    for (let unit of ['',' KB',' MB',' GB',' TB']) {
        str = unit ? size.toFixed(1) + unit : size + unit;
        if (size < 1024) return str;
        size = size / 1024;
    }
    return str;
}

function cmp(key) {
    return key == 'n' ? (x, y)=> ! x.type &&   y.type ? -1
                               :   x.type && ! y.type ?  1
                               :   x.name  <   y.name ? -1
                               :   x.name  >   y.name ?  1
                               :                         0
         : key == 'N' ? (x, y)=> ! x.type &&   y.type ? -1
                               :   x.type && ! y.type ?  1
                               :   x.name  <   y.name ?  1
                               :   x.name  >   y.name ? -1
                               :                         0
         : key == 'm' ? (x, y)=> ! x.type &&   y.type ? -1
                               :   x.type && ! y.type ?  1
                               :   x.time  <   y.time ? -1
                               :   x.time  >   y.time ?  1
                               :                         0
         : key == 'M' ? (x, y)=> ! x.type &&   y.type ? -1
                               :   x.type && ! y.type ?  1
                               :   x.time  <   y.time ?  1
                               :   x.time  >   y.time ? -1
                               :                         0
         : key == 's' ? (x, y)=> ! x.type &&   y.type ? -1
                               :   x.type && ! y.type ?  1
                               :   x.size  <   y.size ? -1
                               :   x.size  >   y.size ?  1
                               :   x.name  <   y.name ? -1
                               :   x.name  >   y.name ?  1
                               :                         0
         : key == 'S' ? (x, y)=> ! x.type &&   y.type ? -1
                               :   x.type && ! y.type ?  1
                               :   x.size  <   y.size ?  1
                               :   x.size  >   y.size ? -1
                               :   x.name  <   y.name ? -1
                               :   x.name  >   y.name ?  1
                               :                         0
         : key == 't' ? (x, y)=> ! x.type &&   y.type ? -1
                               :   x.type && ! y.type ?  1
                               :   x.type  <   y.type ? -1
                               :   x.type  >   y.type ?  1
                               :   x.name  <   y.name ? -1
                               :   x.name  >   y.name ?  1
                               :                         0
         : key == 'T' ? (x, y)=> ! x.type &&   y.type ? -1
                               :   x.type && ! y.type ?  1
                               :   x.type  <   y.type ?  1
                               :   x.type  >   y.type ? -1
                               :   x.name  <   y.name ? -1
                               :   x.name  >   y.name ?  1
                               :                         0
         :              cmp('n');
}

function uc(c) { return c.toUpperCase() }

module.exports = class Folder extends File {

    _table() {

        const req = this._req;
        const msg = req.msg;
        const s   = req.param('s') || 'n';

        const opt = {}, ord = {};
        for (let x of ['n','m','s','t']) {
            opt[x] = s == x ? uc(x) : x;
            ord[x] = s == x     ? ' class="l-asc"'
                   : s == uc(x) ? ' class="l-desc"'
                   :              '';
        }

        const query = req.cmd ? `?cmd=${req.cmd}&s=` : '?s=';

        let html = '<table id="l-folder">\n'
                 + '<thead>\n'
                 + `<tr><th${ord.n}><a href="${cdata(query + opt.n)}">`
                            + `${cdata(msg('folder.name'))}</a></th>`
                     + `<th${ord.m}><a href="${cdata(query + opt.m)}">`
                            +`${cdata(msg('folder.time'))}</a></th>`
                     + `<th${ord.s}><a href="${cdata(query + opt.s)}">`
                            +`${cdata(msg('folder.size'))}</a></th>`
                     + `<th${ord.t}><a href="${cdata(query + opt.t)}">`
                            +`${cdata(msg('folder.type'))}</a></th>`
                 + '</thead>\n'
                 + '<tbody>\n';

        for (let file of this._r.files.sort(cmp(s))) {

            let name = file.name + (file.type ? '' : '/');
            let link = encodeURIComponent(file.name) + (file.type ? '' : '/')
                        + (req.cmd ? `?cmd=${req.cmd}` : '');
            let time = timeStr(file.time);
            let size = sizeStr(file.size);

            html += `<tr><td class="l-name"><a href="${cdata(link)}">`
                        +`${cdata(name)}</a></td>`
                      + `<td class="l-time">${cdata(time)}</td>`
                      + `<td class="l-size">${cdata(size)}</td>`
                      + `<td class="l-type">${cdata(file.type)}</td></tr>\n`;
        }

        html += '</tbody>\n'
              + '</table>\n';

        return html;
    }

    _title() {

        const req = this._req;

        this.title(`LiuLian:${decodeURIComponent(req.path)}`);

        return '<h1 id="l-title">'
                    + ( req.cmd == 'edit'
                            ? '<a href="'
                                    + cdata(fixpath(req.path, req.baseUrl))
                                    + '">'
                                    + cdata(this.title()) + '</a>'
                            : cdata(this.title()) )
                    + '</h1>\n';
    }

    _mkfile() {

        if (this._req.cmd != 'edit') return ''

        const req = this._req;
        const msg = req.msg;

        return '<form id="l-mkfile" method="POST" '
                    + 'enctype="multipart/form-data">\n'
             + '<fieldset>'
             + `<legend>${cdata(msg('mkfile.label'))}</legend>\n`
             + '<input type="hidden" name="session_id" '
                    + `value="${cdata(req.sessionID)}" >\n`
             + `${cdata(msg('mkfile.filename'))} `
                    + '<input type="text" name="filename">\n'
             + '<input type="file" name="file">'
             + '<span>\n'
             + '<img src="'
                    + cdata(fixpath('/css/icon-upload-alt.png', req.baseUrl))
                    + '">\n'
             + '</span>\n'
             + `<input type="submit" value="${cdata(msg('mkfile.submit'))}">\n`
             + '</fieldset>\n'
             + '</form>\n'
             + '<script>'
                 + 'var file = document.querySelector('
                        + '\'#l-mkfile input[name="file"]\');\n'
                 + 'var filename = document.querySelector('
                        + '\'#l-mkfile input[name="filename"]\');\n'
                 + 'var span = document.querySelector(\'#l-mkfile span\');\n'
                 + 'var img = document.querySelector(\'#l-mkfile img\');\n'
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

    _mkdir() {

        if (this._req.cmd != 'edit') return ''

        const req = this._req;
        const msg = req.msg;

        return '<form id="l-mkdir" method="POST">\n'
             + '<fieldset>'
             + `<legend>${cdata(msg('mkdir.label'))}</legend>\n`
             + '<input type="hidden" name="session_id" '
                    + `value="${cdata(req.sessionID)}" >\n`
             + `${cdata(msg('mkdir.dirname'))} `
                    + '<input type="text" name="dirname">\n'
             + `<input type="submit" value="${cdata(msg('mkdir.submit'))}">\n`
             + '</fieldset>\n'
             + '</form>\n';
    }

    _rmdir() {

        if (this._req.cmd != 'edit') return ''
        if (this._req.path == '/')   return ''
        if (this._r.files.length)    return ''

        const req = this._req;
        const msg = req.msg;

        return '<form id="l-rmdir" method="POST">\n'
             + '<fieldset>'
             + `<legend>${cdata(msg('rmdir.label'))}</legend>\n`
             + '<input type="hidden" name="session_id" '
                    + `value="${cdata(req.sessionID)}" >\n`
             + `<input type="hidden" name="rmdir" `
                    + `value="${cdata(this._r.name)}">\n`
             + `<input type="submit" value="${cdata(msg('rmdir.submit'))}">\n`
             + '</fieldset>\n'
             + '</form>\n';
    }

    _form() {
        return this._mkfile()
             + this._mkdir()
             + this._rmdir();
    }

    folder(html) {
        return this.stringify(
              (html ? html : this._title())
            + this._path()
            + this._table()
        );
    }

    edit() {
        return this.stringify(
              this._title()
            + this._form()
            + this._path()
            + this._table()
        );
    }
}
