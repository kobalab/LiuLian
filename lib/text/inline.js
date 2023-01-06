/*
 *  text/inline.js
 */
"use strict";

const replacer = require('../util/replacer');
const { cdata, cref, strip, fixpath } = require('../util/html-escape');

const link_pt = '(?:https?|ftp)://[\\w\\.\\-/~\\?=%&#:;,\\$\\+]+'
              + '|(?:mailto:)?[\\w\\.\\-]+@[\\w\\-]+(?:\\.[\\w\\-]+)+';

const m1      = (`(?: \\*\\*            .*?  \\*\\* `
                +  `|   '  '            .*?    '  ' `
                +  `|   %  %            .*?    %  % `
                +  `| \`\`\`            .*?  \`\`\` `
                +  `|  \` \`            .*?   \` \` `
                +  `| \\(\\(            .*?  \\)\\) `
                +  `|   {  {            .*?    }  } `
                +  `| \\[\\[ (?!\\[)    .*?  \\]\\] `
                +  `| & \\w+ (?:\\( .*? \\))? (?:{           .*? })? ; `
                +  `)`);
const m2      = (`(?: \\*\\*  (?:${m1}|.)*?  \\*\\* `
                +  `|   '  '  (?:${m1}|.)*?    '  ' `
                +  `|   %  %  (?:${m1}|.)*?    %  % `
                +  `| \`\`\`  (?:${m1}|.)*?  \`\`\` `
                +  `|  \` \`  (?:${m1}|.)*?   \` \` `
                +  `| \\(\\(  (?:${m1}|.)*?  \\)\\) `
                +  `|   {  {            .*?    }  } `
                +  `| \\[\\[ (?!\\[)    .*?  \\]\\] `
                +  `| & \\w+ (?:\\( .*? \\))? (?:{ (?:${m1}|.)*? })? ; `
                +  `)`);
const m3      = (`(?: \\*\\*  (?:${m2}|.)*?  \\*\\* `
                +  `|   '  '  (?:${m2}|.)*?    '  ' `
                +  `|   %  %  (?:${m2}|.)*?    %  % `
                +  `| \`\`\`  (?:${m2}|.)*?  \`\`\` `
                +  `|  \` \`  (?:${m2}|.)*?   \` \` `
                +  `| \\(\\(  (?:${m2}|.)*?  \\)\\) `
                +  `|   {  {            .*?    }  } `
                +  `| \\[\\[ (?!\\[)    .*?  \\]\\] `
                +  `| & \\w+ (?:\\( .*? \\))? (?:{ (?:${m2}|.)*? })? ; `
                +  `)`);
const mark_pt = m3.replace(/\s+/g,'');

function link(str) {
    let href = str.match(/:/) ? str : 'mailto:' + str;
    return href.match(/^mailto:/)
            ? `<a href="${cdata(href)}">${cdata(str)}</a>`
            : `<a href="${cdata(href)}" target="_blank">${cdata(str)}</a>`;
}

const text   = replacer(link_pt, link, cref);


module.exports = function(parser) {

    const inline = replacer(mark_pt, markup, text);

    function markup(str) {

        let match;

        if (match = str.match(/^\*\*(.*)\*\*$/))
                    return `<strong>${inline(match[1])}</strong>`;
        if (match = str.match(/^''(.*)''$/))
                    return `<em>${inline(match[1])}</em>`;
        if (match = str.match(/^%%(.*)%%$/))
                    return `<del>${inline(match[1])}</del>`;
        if (match = str.match(/^```(.*)```$/))
                    return `<kbd>${inline(match[1])}</kbd>`;
        if (match = str.match(/^``(.*)``$/))
                    return `<code>${inline(match[1])}</code>`;
        if (match = str.match(/^{{(.*)}}$/))
                    return cdata(match[1]);
        if (match = str.match(/^\[\[(.*)\]\]$/))
                    return bracket(match[1]);
        if (match = str.match(/^\(\((.*)\)\)$/))
                    return footnote(match[1]);

        let [ , name, param, value ]
                = str.match(/^&(\w+)(?:\((.*?)\))?(?:{(.*)})?;$/);
        if (name == '_') return tag(str, param, value);

        if (parser) return parser.inlineModule(str, name, param, value);
        return cref(str);
    }

    function fixlink(path) {
        return parser ? fixpath(path, parser._r._req.baseUrl) : fixpath(path);
    }

    function bracket(str) {
        if (str.match(/^[^|]*$/)) {
            return `<a href="${cdata(fixlink(str))}"`
                        + (str.match(/^(?:https?|ftp):/)
                                ? ' target="_blank"' : '')
                        + `>${cdata(str)}</a>`;
        }
        else {
            let [ , title, href ] = str.match(/^(.*)\|(.*)$/);
            return `<a href="${cdata(fixlink(href))}"`
                        + (href.match(/^(?:https?|ftp):/)
                                ? ' target="_blank"' : '')
                        + `>${inline(title)}</a>`;
        }
    }

    function footnote(str) {
        let note = inline(str);
        if (! parser) return `(${note})`;

        let n = parser.noteref(note);
        return `<sup class="l-footnote">`
             + `<a id="l-noteref${n}" href="#l-footnote${n}" `
                + `title="${cdata(strip(note))}">`
             + `*${n.replace(/^.*\./,'')}</a></sup>`;
    }

    function tag(str, param, value) {
        if (! param.match(/^\w+(?:\s+\w+(?:="[^>]*?")?)*$/)) return cdata(str);
        return value == null ? `<${param}>`
                             : `<${param}>${inline(value)}`
                                        + `</${param.replace(/\s.*$/,'')}>`;
    }

    return inline;
}
