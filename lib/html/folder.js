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

module.exports = class Folder extends HTML {

    constructor(folder) {
        super(folder._req);
        this._folder = folder;
    }

    _table() {

        const msg = this._req.msg;

        let html = '<table id="ll-folder">\n'
                 + '<thead>\n'
                 + `<tr><th>${cdata(msg('folder.thead.name'))}</th>`
                     + `<th>${cdata(msg('folder.thead.time'))}</th>`
                     + `<th>${cdata(msg('folder.thead.size'))}</th>`
                     + `<th>${cdata(msg('folder.thead.type'))}</th></tr>\n`
                 + '</thead>\n'
                 + '<tbody>\n';

        for (let file of this._folder.files) {

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
