/*
 *  resource/markdown
 */
"use strict";

const HTML = require('../html/text');
const Text = require('./text');

const md = require('markdown-it')({
    html: true,
});

module.exports = class Markdown extends Text {

    async update() {
        await super.update();
        if (this._req.param('text')) this._redirect = [303, this.name];
    }

    send(res) {
        if      (this._req.cmd == 'edit') res.sendText(new HTML(this).edit());
        else if (this._req.cmd == 'log')  res.sendText(new HTML(this).log());
        else if (this._req.cmd == 'diff') res.sendText(new HTML(this).diff());
        else {
            this._html = new HTML(this);
            res.sendText(this._html.stringify(md.render(this._text)));
        }
    }
}
