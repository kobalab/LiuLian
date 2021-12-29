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
        this._backup  = req.config.backup;
    }

    get path() { return this._path }
    get name() {
        if (! this._name) this._name = basename(this._path);
        return this._name;
    }
    get size() { return this._stat.size }
    get time() { return this._stat.mtimeMs }
    get type() {
        if (! this._type) this._type = (! this.name.match(/\./)
                                            ? 'text/x-liulian'
                                            : mime.getType(this.name)
                                                || 'application/octet-stream');
        return this._type;
    }
    get location() { return this._location }
    get redirect() { return this._redirect }
    get log()      { return this._log      }

    async open() {
        if (! this._req.user && (this._req.cmd == 'edit' ||
                                 this._req.cmd == 'log'  ||
                                 this._req.cmd == 'diff'    )) throw 403;
        try {
            const fh = await fs.open(this._path);
            fh.close();
        }
        catch(err) {
            throw 403;
        }
        if (this._backup && (this._req.cmd == 'edit' ||
                             this._req.cmd == 'log'))
        {
            if (Date.now() - this.time > 1000*60*60*24) {
                await this._backup.checkIn(this.location,
                                           this.time, this._req.user);
            }
        }
        if (this._backup && this._req.cmd == 'log') {
            this._log = await this._backup.log(this.location);
        }
        return this;
    }

    async update() {
        if (! this._req.user) throw 403;
        this._redirect = [303, './?cmd=edit'];

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
        if      (this._req.cmd == 'edit') res.sendText(new HTML(this).edit());
        else if (this._req.cmd == 'log')  res.sendText(new HTML(this).log());
        else {
            try {
                let rev = this._req.param('rev');
                if (rev) {
                    res.sendStream(
                        this._backup.checkOutStream(this.location, rev),
                        this.type);
                    return;
                }
            }
            catch (err) {}
            res.sendFile(this._path, this.type);
        }
    }
}
