/*
 *  text/inline.js
 */
"use strict";

const replacer = require('../util/replacer');
const { cdata, cref, strip } = require('../util/html-escape');

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
    return `<a href="${cdata(href)}">${cdata(str)}</a>`;
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

        if (parser) return parser.module(str, name, param, value, inline);
        return cdata(str);
    }

    function bracket(str) {
        if (str.match(/^[^|]*$/)) {
            return `<a href="${cdata(encodeURI(str))}">${cdata(str)}</a>`;
        }
        else {
            let [ , title, href ] = str.match(/^(.*)\|(.*)$/);
            return `<a href="${cdata(encodeURI(href))}">${inline(title)}</a>`;
        }
    }

    function footnote(str) {
        let note = inline(str);
        if (! parser) return `(${note})`;

        let n = parser.noteref(note);
        return `<sup class="l-footnote">`
             + `<a id="l-noteref.${n}" href="#l-footnote.${n}" `
                + `title="${cdata(strip(note))}">`
             + `*${n}</a></sup>`;
    }

    function tag(str, param, value) {
        if (! param.match(/^\w+(?:\s+\w+(?:="[^>]*?")?)*$/)) return cdata(str);
        return value == null ? `<${param}>`
                             : `<${param}>${inline(value)}`
                                        + `</${param.replace(/\s.*$/,'')}>`;
    }

    return inline;
}
