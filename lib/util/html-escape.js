/*
 *  util/html-escape
 */

const replacer = require('./replacer');

const cref_pt = '(?:&\\w+;|&#\\d+;|&#x[0-9a-fA-F]+;)';

function cdata(str) {
    return str.replace(/&/g,'&amp;')
              .replace(/"/g,'&quot;')
              .replace(/</g,'&lt;')
              .replace(/>/g,'&gt;');
}

const cref = replacer(cref_pt, null, cdata);

function strip(html) {
    return html.replace(/<.*?>/g, '')
               .replace(/&gt;/g,  '>')
               .replace(/&lt;/g,  '<')
               .replace(/&quot;/g,'"')
               .replace(/&amp;/g, '&');
}

module.exports = {
    cdata:  cdata,
    cref:   cref,
    strip:  strip
};
