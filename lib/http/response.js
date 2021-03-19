/*
 *  http/response
 */
"use strict";

const fs = require('fs');

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

    _cleanUp() {
        for (let key of this._req.files()) {
            for (let file of this._req.files(key)) {
                fs.unlink(file.path, ()=>{});
            }
        }
    }

    sendText(text, type = 'text/html') {
        this._res.type(type).send(text);
        this._cleanUp();
    }

    sendFile(path) {
        this._res.sendFile(path);
        this._cleanUp();
    }

    redirect(code, path) {
        if (code > 400 || ! STATS_LINE[code]) return this.error(500);
        this._res.redirect(code, this._req.fullUrl(path));
        this._cleanUp();
    }

    error(code) {

        const msg = this._req.msg;

        if (code < 400 || ! STATS_LINE[code]) code = 500;
        const statusLine = STATS_LINE[code];

        const method = this._req.method;
        const url    = decodeURIComponent(this._req.baseUrl + this._req.path);

        const message = (code == 400) ? msg('error.400')
                      : (code == 401) ? msg('error.401')
                      : (code == 403) ? msg('error.403', url)
                      : (code == 404) ? msg('error.404', url)
                      : (code == 405) ? msg('error.405', method, url)
                      : (code == 406) ? msg('error.406', url)
                      :                 msg('error.500');

        this._res.status(code);

        this.sendText(new HTML(this._req).error(code, statusLine, message));
    }

    login() {
        this.sendText(new HTML(this._req).login());
    }

    adduser() {
        this.sendText(new HTML(this._req).adduser());
    }

    echo() {
        this.sendText(new HTML(this._req).echo());
    }
}
