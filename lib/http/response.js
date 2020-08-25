/*
 *  http/response
 */
"use strict";

const { cdata, cref } = require('../util/html-escape');
const HTML = require('../html');

const STATS_LINE = {

    '301': 'Moved Permanently',
    '302': 'Found',
    '303': 'See Other',

    '400': 'Bad Request',
    '401': 'Unauthorized',
    '403': 'Forbidden',
    '404': 'Not Found',
    '405': 'Method Not Allowed',
    '406': 'Not Acceptable',

    '500': 'Internal Server Error',
};

module.exports = class Response {

    constructor(req, res) {
        this._req = req;
        this._res = res;
    }

    send() {
        this._res.send(new HTML(this._req).echo());
    }

    redirect(code, path) {
        if (code > 400 || ! STATS_LINE[code]) return this.error(500);
        this._res.redirect(code, this._req.fullUrl(path));
    }

    error(code) {

        const msg = this._req.msg;

        const html = new HTML(this._req);

        if (code < 400 || ! STATS_LINE[code]) code = 500;
        const status_line = STATS_LINE[code];
        const title = `${code} ${status_line}`;
        html.title(title);

        const method = this._req.method();
        const url    = this._req.baseUrl() + this._req.path();

        const message = (code == 400) ? msg('error.400.message')
                      : (code == 401) ? msg('error.401.message')
                      : (code == 403) ? msg('error.403.message', url)
                      : (code == 404) ? msg('error.404.message', url)
                      : (code == 405) ? msg('error.405.message', method, url)
                      : (code == 406) ? msg('error.406.message', url)
                      :                 msg('error.500.message');

        const content = `<h1>${cref(status_line)}</h1>\n`
                      + `<p class="ll-error">${cref(message)}</p>\n`;

        this._res.status(code);
        this._res.send(html.stringify(content));
    }
}
