/*
 *  resource/text
 */
"use strict";

const fs = require('fs').promises;
const HTML = require('../html/text');

const File = require('./file');

module.exports = class Text extends File {

    get text() { return this._text }

    async open() {
        if (this._req.cmd == 'edit' && ! this._req.user) throw 403;

        try {
            this._text = await fs.readFile(this._path, 'utf-8');
            return this;
        }
        catch(err) {
            throw 403;
        }
    }

    async update() {
        this._redirect = [303, './?cmd=edit'];
        if (! this._req.user) throw 403;

        try {
            let text = this._req.param('text');
            if (text)   await fs.writeFile(this.path, text, 'utf-8');
            else        await fs.unlink(this.path);
        }
        catch(err) {
            throw 403;
        }
    }

    send(res) {
        if (this._req.cmd == 'edit')
                res.sendText(new HTML(this).edit());
        else    res.sendFile(this._path, this.type);
    }
}
