/*
 *  resource/file
 */
"use strict";

const fs = require('fs');
const { basename } = require('path');
const mime = require('mime');

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
        if (! this._type) this._type = mime.getType(this.name);
        return this._type;
    }

    async open() {
        return new Promise((resolve, reject)=>{
            fs.open(this._path, (err, fd)=>{
                if (err) return reject(403);
                fs.close(fd, ()=>resolve(this));
            });
        });
    }

    send(res) {
        res.sendFile(this._path);
    }
}
