/*
 *  html/folder
 */
"use strict";

const HTML = require('./');
const { cdata } = require('../util/html-escape');

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
            html += `<tr><td class="ll-name">`
                        + `<a href="${cdata(file.name)}">`
                        +`${cdata(file.name)}</a></td>`
                      + `<td class="ll-time">${cdata(''+file.time)}</td>`
                      + `<td class="ll-size">${cdata(''+file.size)}</td>`
                      + `<td class="ll-type">${cdata(file.type)}</td></tr>\n`;
        }
        html += '</tbody>\n'
              + '</table>\n';
        return html;
    }

    stringify() {
        let html = `<h1>LiuLian:${cdata(this._req.path)}</h1>\n`
                 + this._path()
                 + this._table();
        return super.stringify(html);
    }
}
