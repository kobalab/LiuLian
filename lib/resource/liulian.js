/*
 *  resource/liulian
 */
"use strict";

const fs = require('fs');
const HTML = require('../html/text');
const parse = require('../text/liulian');

const Text = require('./text');

module.exports = class LiuLian extends Text {

    send(res) {
        if (this._req.cmd == 'edit')
                res.sendText(new HTML(this).edit());
        else    res.sendText(new HTML(this).stringify(parse(this)));
    }
}
