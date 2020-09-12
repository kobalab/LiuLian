/*
 *  resource/text
 */
"use strict";

const fs = require('fs');
const HTML = require('../html/text');

const File = require('./file');

module.exports = class Text extends File {

    get text() { return this._text }

    async open() {
        return new Promise((resolve, reject)=>{
            if (this._req.cmd == 'edit'
                && ! this._req.user) reject(403);

            fs.readFile(this._path, 'utf-8', (err, text)=>{
                if (err) return reject(403);
                this._text = text;
                resolve(this);
            });
        });
    }

    async update() {
        return new Promise((resolve, reject)=>{
            this._redirect = [303, './'];
            if (! this._req.user) reject(403);
            let text = this._req.param('text');
            if (text)
                fs.writeFile(this.path, text, 'utf-8', (err)=>{
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
        else    res.sendText(this._text, this.type);
    }
}
