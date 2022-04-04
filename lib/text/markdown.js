/*
 *  text/markdown
 */
"use strict";

const hljs = require('highlight.js');

module.exports = require('markdown-it')({
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
}).use(require('markdown-it-footnote'));
