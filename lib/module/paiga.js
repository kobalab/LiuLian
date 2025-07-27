/*
 *  module/paiga
 */
"use strict";

const imgbase = '//kobalab.github.io/paiga/2/';

function markup(paistr, w, h) {

    let url, v = 0;
    let html = '<span class="l-mod-paiga" style="white-space:pre;">';

    for (let pai of paistr.match(/[mpsz](?:\d+[\-\=]?)+|[ _]|.+/g)||[]) {

        if (pai == ' ') {
            html += ' ';
        }
        else if (pai == '_') {
            url = imgbase + 'pai.png';
            html += `<img src="${url}" width="${w}" height="${h}"`
                  + ` alt="${pai}">`;
        }
        else if (pai.match(/^[mpsz](?:\d+[\-\=]?)+/)) {
            let s = pai[0];
            for (let n of pai.match(/\d[\-\=]?/g)) {
                let d = n[1]||''; n = n[0];
                if (d == '=' && ! v) {
                    html += `<span style="display:inline-block;width:${h}px">`;
                    v = 1;
                }
                if (d || v) {
                    url = imgbase + s+n+'_.png';
                    if (d == '=') {
                        html += `<img src="${url}" width="${h}" height="${w}"`
                              + ` style="vertical-align:bottom;display:block"`
                              + ` alt="${s+n+'='}">`;
                    }
                    else {
                        html += `<img src="${url}" width="${h}" height="${w}"`
                              + ` alt="${s+n+'-'}">`;
                    }
                }
                else {
                    url = imgbase + s+n+'.png';
                    html += `<img src="${url}" width="${w}" height="${h}"`
                          + ` alt="${s+n}">`;
                }
                if (d != '=') {
                    if (v) html += '</span>';
                    v = 0;
                }
            }
        }
        else {
            html += `<span style="color:red;">${pai}</span>`;
        }
    }
    if (v) html += '</span>';
    html += '</span>';
    return html;
}

module.exports = class Paiga {

    constructor(parser) {
        this._parser = parser;
        this._r      = parser._r;
        this._req    = parser._r._req;
        this._inline = ['paiga'];
        this._block  = [];
        this._np     = [];
    }

    paiga(type, param, value) {
        let w = 24, h = 32;
        if      (! param)      { w = 24; h = 32 }
        else if (param == 'L') { w = 24; h = 32 }
        else if (param == 'M') { w = 18; h = 24 }
        else if (param == 'S') { w = 15; h = 20 }
        else if (param.match(/^\d+x\d+$/)) {
            [ w, h ] = param.split(/x/);
        }
        return markup(value, w, h);
    }
}
