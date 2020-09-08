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
                                        || 'application/octet-stream';
        return this._type;
    }

    async open() {
        return new Promise((resolve, reject)=>{
            if (this._req.param('cmd') == 'edit'
                && ! this._req.user) reject(403);

            fs.open(this._path, (err, fd)=>{
                if (err) return reject(403);
                fs.close(fd, ()=>resolve(this));
            });
        });
    }

    send(res) {
        if (this._req.param('cmd') == 'edit') {
            const html = new HTML(this);
            res.send(html.edit(), html.type);
            return;
        }
        res.sendFile(this._path);
    }
}
