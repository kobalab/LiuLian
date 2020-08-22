/*
 *  util/msg.js
 */
"use strict";

const fs = require('fs');

class Msg {
    constructor(filename) {
        this._ = {};
        for (let line of fs.readFileSync(filename, 'utf-8').split(/\r?\n/)) {
            if (! line.match(/^([^#].*?):(.*)$/)) continue;
            let [ , key, value ] = line.match(/^([^#].*?):(.*)$/);
            this._[key] = value;
        }
    }
    get(...arg) {
        let key = arg[0];
        return this._[key] ? this._[key].replace(/{\$(\d+)}/g, (m,n)=>arg[n])
                           : key;
    }
}

module.exports = function(filename) {
    const msg = new Msg(filename);
    return (key, ...arg)=> msg.get(key, ...arg);
}
