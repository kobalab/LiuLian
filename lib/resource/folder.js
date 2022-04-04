/*
 *  resource/folder
 */
"use strict";

const fs = require('fs').promises;
const { join } = require('path');
const HTML = require('../html/folder');
const parse = require('../text/liulian');
const md    = require('../text/markdown');

const File = require('./file');

function fixname(filename) {
    return filename.replace(/^\./,'_').replace(/[\s\\\/\:\n]/g,'_');
}

module.exports = class Folder extends File {

    constructor(req, path, stat, location, openFile) {
        super(req, path, stat, location, openFile);
        if (req.path.substr(-1) != '/') this._redirect = [302, req.path + '/'];
    }

    get size() { return null }
    get type() { return '' }

    get files() { return this._files }

    async open() {
        if (this._req.cmd == 'edit' && ! this._req.user) throw 403;

        try {
            this._files = [];
            for (let file of await fs.readdir(this._path)) {
                try {
                    let r = await this.openFile(this._req, file);
                    this._files.push(r);
                }
                catch(err) {}
            }
            if (this._req.cmd != 'edit') {
                for (let ext of ['', '.md', '.html', '.htm']) {
                    let index = this._files.find(f=>f.name == 'index' + ext);
                    if (index) return index.open();
                }
            }
            return this;
        }
        catch(err) {
            throw 403;
        }
    }

    async update() {
        if (! this._req.user) throw 403;

        try {
            if (this._req.param('filename') != null) {
                let name = fixname(this._req.param('filename'));
                if (this._req.path == '/' && name == 'css') throw 400;
                this._redirect = [303, './?cmd=edit'];
                if (name) {
                    const path = join(this.path, name);
                    const fh = await fs.open(path, 'w+');
                    fh.close();
                    if (this._req.files('file').length)
                        fs.rename(this._req.files('file')[0].path, path);
                    else {
                        this._redirect = [303, name + '?cmd=edit']
                    }
                }
            }
            else if (this._req.param('dirname') != null) {
                let name = fixname(this._req.param('dirname'));
                if (this._req.path == '/' && name == 'css') throw 400;
                this._redirect = [303, './?cmd=edit'];
                if (name) {
                    const path = join(this.path, name);
                    await fs.mkdir(path);
                    this._redirect = [303, name + '/?cmd=edit'];
                }
            }
            else if (this._req.param('rmdir') == this.name) {
                if (this._req.path == '/') throw 400;
                fs.rmdir(this.path);
                this._redirect = [303, '../?cmd=edit'];
            }
            else {
                this._redirect = [303, './?cmd=edit'];
            }
        }
        catch(err) {
            throw 403;
        }
    }

    async send(res) {
        if (this._req.cmd == 'edit') {
            res.sendText(new HTML(this).edit());
        }
        else {
            let readme;
            for (let file of ['README','README.md']) {
                readme = this._files.find(f=>f.name == file);
                if (readme) break;
            }
            if (readme) {
                await readme.open();
                readme._html = new HTML(this);
                res.sendText(readme._html.folder(
                    readme.type == 'text/x-liulian'
                        ? await parse(readme)
                        : md.render(readme._text)
                ));
            }
            else if (this._req.user) {
                res.sendText(new HTML(this).folder());
            }
            else {
                res.error(403);
            }
        }
    }
}
