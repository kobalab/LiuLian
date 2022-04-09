/*
 *  util/html-escape
 */

const replacer = require('./replacer');

const cref_pt = '(?:&\\w+;|&#\\d+;|&#x[0-9a-fA-F]+;)';

function cdata(str = '') {
    return str.replace(/&/g,'&amp;')
              .replace(/"/g,'&quot;')
              .replace(/</g,'&lt;')
              .replace(/>/g,'&gt;');
}

const cref = replacer(cref_pt, null, cdata);

function getAlt(img) {
    return cref((img.match(/\salt="(.*?)"/)||[])[1]);
}

function strip(html = '') {
    return html.replace(/<img\s?.*?>/g, getAlt)
               .replace(/<.*?>/g, '')
               .replace(/&gt;/g,  '>')
               .replace(/&lt;/g,  '<')
               .replace(/&quot;/g,'"')
               .replace(/&amp;/g, '&');
}

function fixpath(path, base) {
    if (! path.match(/%[0-9a-f]{2}/i)) path = encodeURI(path);
    return base && path.match(/^\/(?!\/)/) ? base + path : path;
}

module.exports = {
    cdata:   cdata,
    cref:    cref,
    strip:   strip,
    fixpath: fixpath,
};
