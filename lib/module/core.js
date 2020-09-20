/*
 *  module/core
 */
"use strict";

const { cdata } = require('../util/html-escape');

module.exports = class Core {

    constructor(parser) {
        this._parser = parser;
        this._inline = ['class'];
        this._block  = ['class'];
    }

    class(type, param, value) {
        if (type == '#') {
            return `<div class="${cdata(param)}">\n${value}</div>\n\n`;
        }
        else {
            return `<span class="${cdata(param)}">${value}</span>`;
        }
    }
}
