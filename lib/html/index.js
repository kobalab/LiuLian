/*
 *  html
 */
"use strict";

const { cdata, cref, fixpath } = require('../util/html-escape');
const DEFAULT_STYLE = '/css/liulian.css';
const DEFAULT_ICON  = '/css/icon.png';

module.exports = class HTML {

    constructor(req) {
        this._req = req;
        this._ = {
            lang:   req.msg(),
            title:  'LiuLian',
            stylesheet: [],
            style:  '',
            icon:   DEFAULT_ICON,
            script: [],
            meta:   [],
        };
        this.msg = req.msg;
    }

    lang(lang) {
        if (lang) this._.lang = lang;
        else      return this._.lang;
        return this;
    }

    title(title) {
        if (title != null) this._.title = title;
        else               return this._.title;
        return this;
    }

    stylesheet(url, media) {
        if (url) this._.stylesheet.push({ url: url, media: media });
        else     return this._.stylesheet;
        return this;
    }

    style(text) {
        if (text) this._.style += text.replace(/\n$/,'') + '\n';
        else      return this._.style;
        return this;
    }

    icon(url) {
        if (url) this._.icon = url;
        else     return this._.icon;
        return this;
    }

    script(script) {
        if (script) this._.script.push(script);
        else        return this._.script;
        return this;
    }

    meta(attr) {
        if (attr) this._.meta.push(attr);
        else      return this._.meta;
        return this;
    }

    _head() {
        const req = this._req;

        const stylesheet = this._.stylesheet.map(opt=>
            '<link rel="stylesheet" type="text/css" '
                    + `href="${cdata(fixpath(opt.url, req.baseUrl))}"`
                    + (opt.media ? ` media="${cdata(opt.media)}"` : '') + '>\n'
        ).join('');
        const style = ! this._.style ? ''
                    : '<style>\n' + this._.style + '</style>\n'

        const icon = '<link rel="icon" href="'
                        + cdata(fixpath(this._.icon, req.baseUrl)) + '">\n'
                   + '<link rel="apple-touch-icon" href="'
                        + cdata(fixpath(this._.icon, req.baseUrl)) + '">\n';

        const scriptRef = this.script().filter(opt=>opt.url).map(opt=>
            `<script src="${cdata(fixpath(opt.url, req.baseUrl))}"></script>\n`
        ).join('');
        const scriptCode = this.script().filter(opt=>opt.code).map(opt=>
            `<script>\n${opt.code}</script>\n`
        ).join('');

        const ogp = '<meta name="twitter:card" content="summary">\n'
                  + '<meta property="og:title" '
                        + `content="${cref(this.title())}">\n`
                  + '<meta property="og:image" content="'
                        + this._req.fullUrl(fixpath(this._.icon, req.baseUrl))
                        + '>\n';

        const meta = this._.meta.map(attr=>{
            let attrs = Object.keys(attr).map(key=>
                            `${cdata(key)}="${cdata(attr[key])}"`).join(' ');
            return `<meta ${attrs}>\n`;
        }).join('');

        return '<head>\n'
             + '<meta charset="utf-8">\n'
             + '<meta name="viewport" '
                + 'content="width=device-width, initial-scale=1">\n'
             + meta
             + `<title>${cref(this.title())}</title>\n`
             + ogp
             + scriptRef
             + icon
             + stylesheet
             + style
             + scriptCode
             + '</head>\n';
    }

    _editmenu() { return '' }

    _logmenu()  { return '' }

    _toolbar() {
        const msg = this.msg;
        const req = this._req;
        let html;
        html  = `<div id="l-toolbar">\n`
              + `<a class="l-home" href="${cdata(fixpath('/', req.baseUrl))}">`
                + '<img src="'
                        + cdata(fixpath('/css/liulian.png', req.baseUrl)) + '"'
                        + ` alt="${cdata(msg('toolbar.home'))}"></a>\n`
              + `<ul>\n`;
        if (this._req.user) {
            html += this._logmenu();
            html += this._editmenu();
            const url = '?cmd=logout&session_id='
                            + encodeURIComponent(this._req.sessionID);
            html += `<li><a href="${cdata(url)}">`
                        + `${cdata(msg('toolbar.logout'))}</a></li>\n`;
        }
        else {
            const url = `?cmd=login`;
            html += `<li><a href="${cdata(url)}">`
                        + `${cdata(msg('toolbar.login'))}</a></li>\n`;
        }
        html += `</ul>\n`
              + `<hr>\n`
              + `</div>\n`;
        return html;
    }

    _footer() {
        let original = this._req.scheme + '://' + this._req.host
                            + this._req.baseUrl
                        == this._req.productUrl.replace(/\/$/,'');
        return `<div id="l-footer">\n`
             + `<hr>\n`
             + `<address><a href="${cdata(this._req.productUrl)}"`
                + (original ? '' : ' target="_blank"')
                + `>LiuLian/${cdata(this._req.version)}</a></address>\n`
             + `</div>\n`;
    }

    stringify(content = '', needDefaultStyle = ! this._.stylesheet.length) {
        if (needDefaultStyle) this._.stylesheet.push({url: DEFAULT_STYLE});
        return '<!DOCTYPE html>\n'
             + `<html lang="${cdata(this.lang())}">\n`
             + this._head()
             + '<body>\n'
             + this._toolbar()
             + content
             + this._footer()
             + '</body>\n'
             + '</html>\n';
    }

    error(code, statusLine, message) {
        this.title(`${code} ${statusLine}`);
        message = message.split(/\n/).map(line=>`<p>${cref(line)}</p>`)
        let html = `<h1>${cref(statusLine)}</h1>\n`
                 + `<div class="l-error">${message.join('')}</div>\n`;
        return this.stringify(html);
    }

    login() {
        const msg = this._req.msg;
        this.title(msg('login.title'));
        let html
            = `<h1>${cdata(this.title())}</h1>\n`
            + `<form id="l-login" method="POST" `
                + `action="${cdata('?LOGIN')}">\n`
            + `<dl>\n`
            + `<dt>${cdata(msg('login.user'))}</dt>`
                + `<dd><input name="user" type="text"></dd>\n`
            + `<dt>${cdata(msg('login.passwd'))}</dt>`
                + `<dd><input name="passwd" type="password"></dd>\n`
            + `</dl>\n`
            + `<input type="submit" value="${cdata(msg('login.submit'))}">\n`
            + `</form>\n`;
        return this.stringify(html);
    }

    adduser() {
        const msg = this._req.msg;
        this.title(msg('adduser.title'));
        let html
            = `<h1>${cdata(this.title())}</h1>\n`
            + `<form id="l-adduser" method="POST" `
                + `action="${cdata('?ADDUSER')}">\n`
            + `<dl>\n`
            + `<dt>${cdata(msg('adduser.user'))}</dt>`
                + `<dd><input name="user" type="text"></dd>\n`
            + `<dt>${cdata(msg('adduser.passwd'))}</dt>`
                + `<dd><input name="passwd" type="password"></dd>\n`
            + `</dl>\n`
            + `<input type="submit" value="${cdata(msg('adduser.submit'))}">\n`
            + `</form>\n`;
        return this.stringify(html);
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
              + `<tr><th>pathDir</th>  <td>${cdata(req.pathDir)}</td></tr>\n`
              + `<tr><th>query</th>    <td>${cdata(req.query)}</td></tr>\n`
              + `<tr><th>remote</th>   <td>${cdata(req.remote)}</td></tr>\n`
              + `<tr><th>sessionID</th><td>${cdata(req.sessionID)}</td></tr>\n`
              + `<tr><th>user</th>     <td>${cdata(req.user)}</td></tr>\n`
              + `<tr><th>cmd</th>      <td>${cdata(req.cmd)}</td></tr>\n`
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

        if (req.param().length) {
            html += `<h2>Params</h2>\n`
                  + '<table>\n';
            for (let key of req.params()) {
                let value = req.params(key).map(x=>cdata(x)).join('<br>');
                html += `<tr><th>${cdata(key)}</th><td>${value}</td></tr>\n`
            }
            html += '</table>\n';
        }

        if (req.files().length) {
            html += '<h2>Files</h2>\n'
                  + '<table>\n';
            for (let key of req.files()) {
                let value = req.files(key).map(x=>cdata(x.name)).join('<br>');
                html += `<tr><th>${cdata(key)}</th><td>${value}</td></tr>\n`
            }
            html += '</table>\n';
        }

        return this.stringify(html);
    }
}
