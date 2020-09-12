/*
 *  resource/folder
 */
"use strict";

const fs = require('fs');
const { join } = require('path');
const HTML = require('../html/folder');

const File = require('./file');

function fixname(filename) {
    return filename.replace(/^\./,'_').replace(/[\s\\\/\:\n]/g,'_');
}

module.exports = class Folder extends File {

    constructor(req, path, stat) {
        super(req, path, stat);
        if (req.path.substr(-1) != '/') this._redirect = [302, req.path + '/'];
    }

    get size() { return null }
    get type() { return '' }

    get files() { return this._files }

    async open() {
        return new Promise((resolve, reject)=>{
            if (this._req.cmd == 'edit'
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
                            if (stat.isDirectory())
                                this._files.push(
                                    new Folder(this._req, path, stat))
                            else if (stat.isFile())
                                this._files.push(
                                    new File(this._req, path, stat))
                        }
                        if (! --n) resolve(this);
                    });
                }
            })
        });
    }

    async update() {
        return new Promise((resolve, reject)=>{

            const req = this._req;
            if (! req.user) reject(403);

            if (req.param('filename') != null) {
                let name = fixname(req.param('filename'));
                this._redirect = [303, './'];
                if (name) {
                    const path = join(this.path, name);
                    fs.open(path, 'w+', (err, fd)=>{
                        if (err) return reject(403);
                        fs.close(fd, ()=>{
                            if (req.files('file').length)
                                fs.rename(req.files('file')[0].path, path, ()=>{
                                    resolve();
                                })
                            else {
                                this._redirect = [303, name + '?cmd=edit']
                                resolve();
                            }
                        });
                    });
                }
                else resolve();
            }
            else if (req.param('dirname') != null) {
                let name = fixname(req.param('dirname'));
                this._redirect = [303, './'];
                if (name) {
                    const path = join(this.path, name);
                    fs.mkdir(path, (err)=>{
                        if (err) return reject(403);
                        this._redirect = [303, name];
                        resolve();
                    });
                }
                else resolve();
            }
            else {
                if (req.path == '/') return reject(400);
                fs.rmdir(this.path, (err)=>{
                    if (err) return reject(403);
                    this._redirect = [303, '../'];
                    resolve();
                });
            }
        });
    }

    send(res) {
        if (this._req.cmd == 'edit')
                res.sendText(new HTML(this).edit());
        else    res.sendText(new HTML(this).folder());
    }
}
