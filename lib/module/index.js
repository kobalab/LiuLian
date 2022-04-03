/*
 * module
 */
"use strict";

const { cdata } = require('../util/html-escape');

const modules = {};

module.exports = class Module {

    constructor(parser) {
        this._parser = parser;
        this._modules = [];
        this.import('core');
    }

    import(module) {
        try {
            if (! modules[module]) modules[module] = require('./' + module);
            this._modules.push(new modules[module](this._parser));
            return modules[module];
        }
        catch(err) {
            if (err.code) console.log(module, err.code);
            else          console.log(err);
        }
    }

    callInlineModule(str, name, param, value) {
        for (let m of this._modules) {
            if (m._inline.find(n=>n == name)) {
                if (value) value = this._parser.inline(value);
                return m[name].call(m, '&', param, value);
            }
        }
        if (str.match(/^&\w+;$/)) return str;
        return '<span style="color:red">' + cdata(str) + '</span>';
    }

    async callBlockModule(line, name, param, eod) {
        for (let m of this._modules) {
            if (m._block.find(n=>n == name)) {
                let value;
                if (eod) {
                    if (m._np.find(n=>n == name))
                            value = await this._parser.npBlock(eod);
                    else    value = (await this._parser.block(eod))
                                                        .replace(/\n$/,'');
                }
                return await m[name].call(m, '#', param, value);
            }
        }
        return '<div style="color:red">' + cdata(line) + '</div>\n\n';
    }
}
