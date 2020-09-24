/*
 *  module/core
 */
"use strict";

const resource = require('../resource');
const { cdata } = require('../util/html-escape');

module.exports = class Core {

    constructor(parser) {
        this._parser = parser;
        this._r      = parser._r;
        this._inline = ['img','color','size','br','clear','class'];
        this._block  = ['title','contents','footnote','include','img','clear',
                        'class','style','icon'];
        this._np     = ['style'];
    }

    async title(type, param) {
        this._title = param;
        const value = await this._parser.block();
        this._r.title(this._title.replace(/\$\$/g, this._parser._.title));
        return value;
    }

    async contents(type, param) {
        const value = await this._parser.block();
        this._parser.insertText(this._parser._.toc.join('\n'), true);
        return '<div class="l-contents">\n'
             + (await this._parser.block()).replace(/\n$/,'')
             + '</div>\n\n'
             + value;
    }

    footnote(type, param) {
        const html = this._parser.footnote();
        this._parser._.note = [];
        this._parser._.notebase++;
        return html;
    }

    async include(type, param) {
        const err = `<div style="color:red">#include(${cdata(param)})</div>\n\n`;
        try {
            const r = await resource(this._r._req, param);
            if (r.type != 'text/x-liulian') return err;
            await r.open();
            this._parser.insertText(r.text, true);
            return '';
        }
        catch(code) {
            return err;
        }
    }

    img(type, param) {
        let opts = param.split(/,\s*/);
        let src = opts.shift();
        let alt = opts.shift();

        src = this._r._req.fixpath(src);

        let match, link, style = {};
        for (let opt of opts) {
            if      (opt == 'link') link = true;
            else if (opt.match(/^left|right$/))
                                    style.float  = opt;
            else if (match = opt.match(/^b(\d+)$/))
                                    style.border = + match[1] ?
                                                    'solid ' + match[1] + 'px'
                                                    : 'none';
            else if (match = opt.match(/^w(\d+)$/))
                                    style.width  = match[1] + 'px';
            else if (match = opt.match(/^h(\d+)$/))
                                    style.height = match[1] + 'px';
            else if (match = opt.match(/^(\d+)x(\d+)$/)) {
                                    style.width  = match[1] + 'px';
                                    style.height = match[2] + 'px'; }
            else if (match = opt.match(/^(.+?):(.+)$/))
                                    style[match[1]] = match[2];
            else                    style['vertical-align'] = opt;
        }
        if (link && ! style.border) style.border = 'solid 1px';
        style = Object.keys(style).map(key=>`${key}:${style[key]}`).join(';');

        return (link ? `<a href="${cdata(src)}">` : '')
             + `<img src="${cdata(src)}" alt="${cdata(alt)}"`
                    + (style ? ` style="${cdata(style)}"` : '')
                    + '>'
             + (link ? '</a>' : '');
    }

    color(type, param, value) {
        let [ color, background, border ] = param.split(/,\s*/);
        let style = (color      ? `color:${color};`             : '')
                  + (background ? `background:${background};`   : '')
                  + (border     ? `border:solid 1px ${border};` : '')
                  + (background || border ? 'display:inline-block;'
                                          + 'padding:1px 2px;'  : '')
                  + (border     ? 'border-radius:2px;'          : '');
        return `<span style="${cdata(style)}">${value}</span>`;
    }

    size(type, param, value) {
        return `<span style="font-size:${cdata(param)}">${value}</span>`;
    }

    br(type, param) {
        return '<br>';
    }

    clear(type, param = 'both') {
        if (type == '#')
                return `<div style="clear:${cdata(param)}"></div>\n\n`;
        else    return `<br style="clear:${cdata(param)}">`;
    }

    class(type, param, value) {
        if (type == '#')
                return `<div class="${cdata(param)}">\n${value}</div>\n\n`;
        else    return `<span class="${cdata(param)}">${value}</span>`;
    }

    style(type, param, value) {
        if (param) this._r.stylesheet(...param.split(/,\s*/));
        if (value) this._r.style(value);
        return '';
    }

    icon(type, param) {
        this._r.icon(param);
        return '';
    }
}
