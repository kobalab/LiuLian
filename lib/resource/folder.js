/*
 *  resource/folder
 */
"use strict";

const fs = require('fs');
const { join } = require('path');
const HTML = require('../html/folder');

const File = require('./file');

module.exports = class Folder extends File {

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
            if (! name) resolve();
            const path = join(this.path, name);
            fs.open(path, 'wx+', (err, fd)=>{
                if (err) return reject(403);
                fs.close(fd, ()=>{
                    fs.rename(this._req.files('file')[0].path, path, ()=>{
                        resolve();
                    })
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
