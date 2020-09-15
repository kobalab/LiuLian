/*
 *  resource/liulian
 */
"use strict";

const fs = require('fs');
const HTML = require('../html/text');
const parse = require('../text/liulian');

const Text = require('./text');

module.exports = class LiuLian extends Text {

    title(title) {
        this._html.title(title);
    }

    send(res) {
        if (this._req.cmd == 'edit') {
            res.sendText(new HTML(this).edit());
        }
        else {
            this._html = new HTML(this);
            res.sendText(this._html.stringify(parse(this)));
        }
    }
}
