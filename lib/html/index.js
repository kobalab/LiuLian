/*
 *  html
 */
"use strict";

const { cdata, cref } = require('../util/html-escape');

module.exports = class HTML {

    constructor(req) {
        this._req = req;
        this._ = {
            lang:   req.msg('Lang'),
            title:  'LiuLian',
        };
        this.msg = req.msg;
    }

    lang(lang) {
        if (lang) this._.lang = lang;
        else      return this._.lang;
        return this;
    }

    title(title) {
        if (title) this._.title = title;
        else      return this._.title;
        return this;
    }

    _head() {
        return '<head>\n'
             + '<meta charset="utf-8">\n'
             + '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
             + `<title>${cref(this.title())}</title>\n`
             + '<link rel="stylesheet" type="text/css" '
                    + `href="${this._req.fixpath('/css/liulian.css')}">\n`
             + '</head>\n';
    }

    stringify(content = '') {
        return '<!DOCTYPE html>\n'
             + `<html lang="${cdata(this.lang())}">\n`
             + this._head()
             + '<body>\n'
             + content
             + '</body>\n'
             + '</html>\n';
    }

    echo() {
        const req = this._req;

        let html = `<h1>${cref(this.msg('greeting'))}</h1>\n\n`;

        html += '<table>\n'
              + `<tr><th>method</th>   <td>${cdata(req.method)}</td></tr>\n`
              + `<tr><th>scheme</th>   <td>${cdata(req.scheme)}</td></tr>\n`
              + `<tr><th>host</th>     <td>${cdata(req.host)}</td></tr>\n`
              + `<tr><th>url</th>      <td>${cdata(req.url)}</td></tr>\n`
              + `<tr><th>baseUrl</th>  <td>${cdata(req.baseUrl)}</td></tr>\n`
              + `<tr><th>path</th>     <td>${cdata(req.path)}</td></tr>\n`
              + `<tr><th>query</th>    <td>${cdata(req.query)}</td></tr>\n`
              + `<tr><th>remote</th>   <td>${cdata(req.remote)}</td></tr>\n`
              + `<tr><th>sessionID</th><td>${cdata(req.sessionID)}</td></tr>\n`
              + `<tr><th>(url)</th>    <td>${cdata(req._req.url)}</td></tr>\n`
              + `<tr><th>(originalUrl)</th>`
                          + `<td>${cdata(req._req.originalUrl)}</td></tr>\n`
              + '</table>\n';

        html += '<h2>Headers</h2>\n'
              + '<table>\n';
        for (let key of req.header()) {
            html += `<tr><th>${cdata(key)}</th>`
                      + `<td>${cdata(req.header(key))}</td></tr>\n`;
        }
        html += '</table>\n';

        if (req.query) {
            html += `<h2>Params</h2>\n`
                  + '<table>\n';
            for (let key of req.params()) {
                let value = req.params(key).map(x=>cdata(x)).join('<br>');
                html += `<tr><th>${cdata(key)}</th><td>${value}</td></tr>\n`
            }
            html += '</table>\n';
        }

        return this.stringify(html);
    }
}
