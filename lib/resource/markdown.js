/*
 *  resource/markdown
 */
"use strict";

const HTML = require('../html/text');
const Text = require('./text');
const md   = require('../text/markdown');

module.exports = class Markdown extends Text {

    async update() {
        await super.update();
        if (this._req.param('text')) this._redirect = [303, this.name];
    }

    async _send(res) {
        this._text = (this.name != 'HEAD.md'
                        ? await this._seekToParent('HEAD.md') + '\n' : '')
                   + this._text                               + '\n'
                   + (this.name != 'TAIL.md'
                        ? await this._seekToParent('TAIL.md') : '');
        this._html = new HTML(this);
        res.sendText(this._html.stringify(md.render(this._text)));
    }
}
