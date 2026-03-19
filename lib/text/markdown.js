/*
 *  text/markdown
 */
"use strict";

const hljs = require('highlight.js');

module.exports = require('markdown-it')({
    html: true,
    linkify: true,
    highlight: function(str, lang) {
        let html = '';
        if (lang) {
            if (hljs.getLanguage(lang)) {
                html = hljs.highlight(str, { language: lang }).value;
            }
            else {
                html = hljs.highlightAuto(str).value;
            }
        }
        return html;
    }
}).use(require('markdown-it-footnote'));
