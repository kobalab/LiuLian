/*
 *  resource/markdown
 */
"use strict";

const HTML = require('../html/text');
const Text = require('./text');

const hljs = require('highlight.js');

const md = require('markdown-it')({
    html: true,
    linkify: true,
    highlight: function(str, lang) {
        const error = console.error; console.error = ()=>{};
        let html = '';
        if (lang) {
            try {
                html = hljs.highlight(lang, str).value;
            }
            catch(err) {
                html = hljs.highlightAuto(str).value;
            }
        }
        console.error = error;
        return html;
    }
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
