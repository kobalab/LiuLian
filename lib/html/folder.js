/*
 *  html/folder
 */
"use strict";

const HTML = require('./');
const { cdata } = require('../util/html-escape');

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
    return key == 'n' ? (x, y)=> ! x.size &&   y.size ? -1
                               :   x.size && ! y.size ?  1
                               :   x.name  <   y.name ? -1
                               :   x.name  >   y.name ?  1
                               :                         0
         : key == 'N' ? (x, y)=> ! x.size &&   y.size ? -1
                               :   x.size && ! y.size ?  1
                               :   x.name  <   y.name ?  1
                               :   x.name  >   y.name ? -1
                               :                         0
         : key == 'm' ? (x, y)=> ! x.size &&   y.size ? -1
                               :   x.size && ! y.size ?  1
                               :   x.time  <   y.time ? -1
                               :   x.time  >   y.time ?  1
                               :                         0
         : key == 'M' ? (x, y)=> ! x.size &&   y.size ? -1
                               :   x.size && ! y.size ?  1
                               :   x.time  <   y.time ?  1
                               :   x.time  >   y.time ? -1
                               :                         0
         : key == 's' ? (x, y)=> ! x.size &&   y.size ? -1
                               :   x.size && ! y.size ?  1
                               :   x.size  <   y.size ? -1
                               :   x.size  >   y.size ?  1
                               :                         0
         : key == 'S' ? (x, y)=> ! x.size &&   y.size ? -1
                               :   x.size && ! y.size ?  1
                               :   x.size  <   y.size ?  1
                               :   x.size  >   y.size ? -1
                               :                         0
         : key == 't' ? (x, y)=> ! x.size &&   y.size ? -1
                               :   x.size && ! y.size ?  1
                               :   x.type  <   y.type ? -1
                               :   x.type  >   y.type ?  1
                               :                         0
         : key == 'T' ? (x, y)=> ! x.size &&   y.size ? -1
                               :   x.size && ! y.size ?  1
                               :   x.type  <   y.type ?  1
                               :   x.type  >   y.type ? -1
                               :                         0
         :              cmp('n');
}

function uc(c) { return c.toUpperCase() }

module.exports = class Folder extends HTML {

    constructor(folder) {
        super(folder._req);
        this._folder = folder;
    }

    _table() {

        const msg = this._req.msg;
        const s = this._req.param('s') || 'n';

        const opt = {}, ord = {};
        for (let x of ['n','m','s','t']) {
            opt[x] = s == x ? uc(x) : x;
            ord[x] = s == x     ? ' class="l-asc"'
                   : s == uc(x) ? ' class="l-desc"'
                   :              '';
        }

        let html = '<table id="l-folder">\n'
                 + '<thead>\n'
                 + `<tr><th${ord.n}><a href="?s=${opt.n}">`
                            + `${cdata(msg('folder.name'))}</a></th>`
                     + `<th${ord.m}><a href="?s=${opt.m}">`
                            +`${cdata(msg('folder.time'))}</a></th>`
                     + `<th${ord.s}><a href="?s=${opt.s}">`
                            +`${cdata(msg('folder.size'))}</a></th>`
                     + `<th${ord.t}><a href="?s=${opt.t}">`
                            +`${cdata(msg('folder.type'))}</a></th>`
                 + '</thead>\n'
                 + '<tbody>\n';

        for (let file of this._folder.files.sort(cmp()).sort(cmp(s))) {

            let name = file.name + (file.type ? '' : '/');
            let link = encodeURIComponent(file.name) + (file.type ? '' : '/');
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
                    + ( req.param('cmd') == 'edit'
                            ? `<a href="${cdata(req.fixpath(req.path))}">`
                                    + `${cdata(this.title())}</a>`
                            : cdata(this.title()) )
                    + '</h1>\n';
    }

    _form() {

        if (this._req.param('cmd') != 'edit') return ''

        const req = this._req;
        const msg = req.msg;

        return '<form id="l-mkfile" method="POST" '
                    + 'enctype="multipart/form-data" '
                    + `action="${cdata(req.fixpath(req.path))}">\n`
             + '<fieldset>'
             + `<legend>${cdata(msg('mkfile.label'))}</legend>\n`
             + '<input type="hidden" name="session_id" '
                    + `value="${cdata(req.sessionID)}" >\n`
             + `${cdata(msg('mkfile.filename'))} `
                    + '<input type="text" name="filename">\n'
             + '<label><img src="'
                    + cdata(req.fixpath('/css/icon-upload-alt.png'))
                    + '"><input type="file" name="file"></label>\n'
             + `<input type="submit" value="${cdata(msg('mkfile.submit'))}">\n`
             + '</fieldset>\n'
             + '</form>\n'
             + '<script>'
                + 'document.querySelector(\'#l-mkfile input[name="file"]\')'
                + '.onchange = function(event) { '
                + 'if (event.target.files.length) {'
                + 'document.querySelector(\'#l-mkfile input[name="filename"]\')'
                + '.value = event.target.files[0].name;'
                + 'document.querySelector(\'#l-mkfile img\')'
                + '.classList.add(\'l-enable\')'
                + '} else { '
                + 'document.querySelector(\'#l-mkfile input[name="filename"]\')'
                + '.value = \'\';'
                + 'document.querySelector(\'#l-mkfile img\')'
                + '.classList.remove(\'l-enable\')'
                + '} }'
             + '</script>\n';
    }

    stringify() {

        let html = this._title()
                 + this._form()
                 + this._path()
                 + this._table();

        return super.stringify(html);
    }
}
