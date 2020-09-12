/*
 *  resource/liulian
 */
"use strict";

const fs = require('fs');
const HTML = require('../html/text');

const Text = require('./text');

module.exports = class LiuLian extends Text {

    send(res) {
        if (this._req.cmd == 'edit')
                res.sendText(new HTML(this).edit());
        else    res.sendText(this._text, this.type);
    }
}
