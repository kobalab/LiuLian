/*
 *  util/replacer.js
 */
"use strict";

module.exports = function(pattern, match, unmatch, opt = '') {

    const regexp1 = new RegExp(`(?:(?!${pattern}).)*(?:${pattern})?`,'g'+opt);
    const regexp2 = new RegExp(`^(.*?)(${pattern})?$`,opt);

    return function(str = '') {
        let rv = '';
        for (let chunk of str.match(regexp1)) {
            let [ , u, m ] = chunk.match(regexp2);
            if (u) rv += unmatch ? unmatch(u) : u;
            if (m) rv += match   ? match(m)   : m;
        }
        return rv;
    }
}
