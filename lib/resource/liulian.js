/*
 *  resource/liulian
 */
"use strict";

const HTML = require('../html/text');
const parse = require('../text/liulian');

const Text = require('./text');

module.exports = class LiuLian extends Text {

    title(title) { this._html.title(title) }
    stylesheet(url, media) { this._html.stylesheet(url, media) }
    style(text) { this._html.style(text) }
    icon(url) { this._html.icon(url) }
    lang(lang) { this._html.lang(lang) }
    script(script) { this._html.script(script) }

    async update() {
        await super.update();
        if (this._req.param('text')) this._redirect = [303, this.name];
    }

    async send(res) {
        if (this._req.cmd == 'edit') {
            res.sendText(new HTML(this).edit());
        }
        else {
            this._html = new HTML(this);
            res.sendText(this._html.stringify(await parse(this)));
        }
    }
}
