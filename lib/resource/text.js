/*
 *  resource/text
 */
"use strict";

const fs = require('fs').promises;
const HTML = require('../html/text');

const File = require('./file');

module.exports = class Text extends File {

    get text() { return this._text }
    get diff() { return this._diff }

    async _seekToParent(filename) {
        let pathDir = this._req.pathDir;
        while (pathDir) {
            try {
                const r = await this.openFile(this._req, pathDir + filename);
                await r.open();
                return r.text;
            }
            catch(e) {
                pathDir = pathDir.replace(/[^\/]*\/$/,'');
            }
        }
        return '';
    }

    async open() {
        await super.open();
        if (this._backup && this._req.cmd == 'diff') {
            let rev = this._req.params('rev');
            this._diff = await this._backup.diff(this.location, ...rev);
            return this;
        }
        try {
            let rev = this._req.param('rev');
            if (rev) {
                this._text = await this._backup.checkOut(this.location, rev);
                return this;
            }
        }
        catch(err) {
            throw 404;
        }
        try {
            this._text = await fs.readFile(this._path, 'utf-8');
        }
        catch(err) {
            throw 403;
        }
        return this;
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
        if      (this._req.cmd == 'edit') res.sendText(new HTML(this).edit());
        else if (this._req.cmd == 'log')  res.sendText(new HTML(this).log());
        else if (this._req.cmd == 'diff') res.sendText(new HTML(this).diff());
        else                              this._send(res);
    }

    _send(res) {
        res.sendFile(this._path, this.type);
    }
}
