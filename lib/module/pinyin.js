/*
 *  module/pinyin
 */
"use strict";

const tone_letter = {
    a: ['ā','á','ǎ','à'],
    e: ['ē','é','ě','è'],
    o: ['ō','ó','ǒ','ò'],
    i: ['ī','í','ǐ','ì'],
    u: ['ū','ú','ǔ','ù'],
    v: ['ǖ','ǘ','ǚ','ǜ'],
    n: ['n̄','ń','ň','ǹ'],
    A: ['Ā','Á','Ǎ','À'],
    E: ['Ē','É','Ě','È'],
    O: ['Ō','Ó','Ǒ','Ò'],
    I: ['Ī','Í','Ǐ','Ì'],
    U: ['Ū','Ú','Ǔ','Ù'],
    V: ['Ǖ','Ǘ','Ǚ','Ǜ'],
    N: ['N̄','Ń','Ň','Ǹ'],
};

function mark(str) {
    const code = (c)=>tone_letter[c][n-1];
    let [ , s, n ] = str.match(/^(.*?)(\d)$/);
    if (s.match(/[aeo]/i))  return s.replace(/[aeo]/i,  code);
    if (s.match(/[iu]$/i))  return s.replace(/[iu]$/i,  code);
    if (s.match(/^[iuv]/i)) return s.replace(/^[iuv]/i, code);
    else                    return s.replace(/n/i,      code);
}

module.exports = class Pinyin {

    constructor(parser) {
        this._parser = parser;
        this._r      = parser._r;
        this._req    = parser._r._req;
        this._inline = ['pinyin'];
        this._block  = ['pinyin'];
        this._np     = [];
    }

    pinyin(type, param, value) {
        value = value.replace(/([aeouiv][1234])([aeo])/ig, '$1-$2');
        value = value.replace(/[iuv]?[aeo]?(?:i|u|o|n|ng)?[1234]/ig, mark);
        value = value.replace(/v/g, 'ü').replace(/V/g, 'Ü');
        return type == '#'
                    ? `<div class="l-mod-pinyin">${value}</div>`
                    : `<span class="l-mod-pinyin">${value}</span>`;
    }
}
