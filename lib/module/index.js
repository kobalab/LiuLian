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

    require(path) {
        try        { return require(path) }
        catch(err) { return }
    }

    import(module) {
        if (! modules[module]) modules[module] = this.require('./' + module);
        if (modules[module]) this._modules.push(
                                        new modules[module](this._parser));
        return modules[module];
    }

    callInlineModule(str, name, param, value) {
        for (let m of this._modules) {
            if (m._inline.find(n=>n == name)) {
                if (value) value = this._parser.inline(value);
                return m[name].call(m, '&', param, value);
            }
        }
        return '<span style="color:red">' + cdata(str) + '</span>';
    }

    async callBlockModule(line, name, param, eod) {
        for (let m of this._modules) {
            if (m._block.find(n=>n == name)) {
                let value;
                if (eod) value = (await this._parser.block(eod))
                                                        .replace(/\n$/,'');
                return await m[name].call(m, '#', param, value);
            }
        }
        return '<div style="color:red">' + cdata(line) + '</div>\n\n';
    }
}
