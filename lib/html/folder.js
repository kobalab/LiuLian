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
            ord[x] = s == x     ? ' class="ll-asc"'
                   : s == uc(x) ? ' class="ll-desc"'
                   :              '';
        }

        let html = '<table id="ll-folder">\n'
                 + '<thead>\n'
                 + `<tr><th${ord.n}><a href="?s=${opt.n}">`
                            + `${cdata(msg('folder.thead.name'))}</a></th>`
                     + `<th${ord.m}><a href="?s=${opt.m}">`
                            +`${cdata(msg('folder.thead.time'))}</a></th>`
                     + `<th${ord.s}><a href="?s=${opt.s}">`
                            +`${cdata(msg('folder.thead.size'))}</a></th>`
                     + `<th${ord.t}><a href="?s=${opt.t}">`
                            +`${cdata(msg('folder.thead.type'))}</a></th>`
                 + '</thead>\n'
                 + '<tbody>\n';

        for (let file of this._folder.files.sort(cmp()).sort(cmp(s))) {

            let name = file.name + (file.type ? '' : '/');
            let link = encodeURIComponent(file.name) + (file.type ? '' : '/');
            let time = timeStr(file.time);
            let size = sizeStr(file.size);

            html += `<tr><td class="ll-name"><a href="${cdata(link)}">`
                        +`${cdata(name)}</a></td>`
                      + `<td class="ll-time">${cdata(time)}</td>`
                      + `<td class="ll-size">${cdata(size)}</td>`
                      + `<td class="ll-type">${cdata(file.type)}</td></tr>\n`;
        }

        html += '</tbody>\n'
              + '</table>\n';

        return html;
    }

    stringify() {

        this.title(`LiuLian:${decodeURIComponent(this._req.path)}`);

        let html = `<h1>${cdata(this.title())}</h1>\n`
                 + this._path()
                 + this._table();
        return super.stringify(html);
    }
}
