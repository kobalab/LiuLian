/*
 *  resource/file
 */
"use strict";

const fs = require('fs').promises;
const { basename } = require('path');
const mime = require('mime');

const HTML = require('../html/file');

module.exports = class File {

    constructor(req, path, stat, location, openFile) {
        this._req  = req;
        this._path = path;
        this._stat = stat;
        this._location = location;
        this.openFile = openFile;
    }

    get path() { return this._path }
    get name() {
        if (! this._name) this._name = basename(this._path);
        return this._name;
    }
    get size() { return this._stat.size }
    get time() { return this._stat.mtimeMs }
    get type() {
        if (! this._type) this._type = mime.getType(this.name)
                                        || (! this.name.match(/\./)
                                                ? 'text/x-liulian'
                                                : 'application/octet-stream');
        return this._type;
    }

    get redirect() { return this._redirect }

    async open() {
        if (this._req.cmd == 'edit' && ! this._req.user) throw 403;

        try {
            const fh = await fs.open(this._path);
            fh.close();
            return this;
        }
        catch(err) {
            throw 403;
        }
    }

    async update() {
        if (! this._req.user) throw 403;
        this._redirect = [303, './'];

        try {
            if (this._req.files('file').length)
                await fs.rename(this._req.files('file')[0].path, this.path);
            else
                await fs.unlink(this.path);
        }
        catch(err) {
            throw 403;
        }
    }

    send(res) {
        if (this._req.cmd == 'edit')
                res.sendText(new HTML(this).edit());
        else    res.sendFile(this._path);
    }
}
