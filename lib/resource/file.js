/*
 *  resource/file
 */
"use strict";

const fs = require('fs');
const { basename } = require('path');
const mime = require('mime');

const HTML = require('../html/file');

module.exports = class File {

    constructor(req, path, stat) {
        this._req  = req;
        this._path = path;
        this._stat = stat;
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
        return new Promise((resolve, reject)=>{
            if (this._req.cmd == 'edit'
                && ! this._req.user) reject(403);

            fs.open(this._path, (err, fd)=>{
                if (err) return reject(403);
                fs.close(fd, ()=>resolve(this));
            });
        });
    }

    async update() {
        return new Promise((resolve, reject)=>{
            this._redirect = [303, './'];
            if (! this._req.user) reject(403);
            if (this._req.files('file').length)
                fs.rename(this._req.files('file')[0].path, this.path, (err)=>{
                    if (err) reject(403);
                    else     resolve();
                });
            else
                fs.unlink(this.path, (err)=>{
                    if (err) reject(403);
                    else     resolve();
                });
        });
    }

    send(res) {
        if (this._req.cmd == 'edit')
                res.sendText(new HTML(this).edit());
        else    res.sendFile(this._path);
    }
}
