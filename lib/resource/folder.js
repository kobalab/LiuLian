/*
 *  resource/folder
 */
"use strict";

const fs = require('fs');
const { join } = require('path');
const HTML = require('../html/folder');

const File = require('./file');

module.exports = class Folder extends File {

    constructor(req, path, stat) {
        super(req, path, stat);
        if (req.path.substr(-1) != '/') this._redirect = [302, req.path + '/'];
    }

    get size() { return null }
    get type() { return '' }

    async open() {
        return new Promise((resolve, reject)=>{
            if (this._req.param('cmd') == 'edit'
                && ! this._req.user) reject(403);

            fs.readdir(this._path, (err, files)=>{
                if (err) return reject(403);
                this._files = [];
                let n = files.length;
                if (! n) resolve(this);
                for (let file of files) {
                    const path = join(this._path, file)
                    fs.stat(path, (err, stat)=>{
                        if (stat) {
                            this._files.push(
                                stat.isDirectory()
                                    ? new Folder(this._req, path, stat)
                                    : new File(this._req, path, stat));
                        }
                        if (! --n) resolve(this);
                    });
                }
            })
        });
    }

    async update() {
        return new Promise((resolve, reject)=>{
            if (! this._req.user) reject(403);
            let name = this._req.param('filename');
            this._redirect = [303, './'];
            if (! name) resolve();
            const path = join(this.path, name);
            fs.open(path, 'w+', (err, fd)=>{
                if (err) return reject(403);
                fs.close(fd, ()=>{
                    if (this._req.files('file').length)
                        fs.rename(this._req.files('file')[0].path, path, ()=>{
                            resolve();
                        })
                    else {
                        this._redirect = [303, name + '?cmd=edit']
                        resolve();
                    }
                });
            });
        });
    }

    send(res) {
        const html = new HTML(this);
        res.send(html.stringify(), html.type);
    }

    get files() { return this._files }
}
