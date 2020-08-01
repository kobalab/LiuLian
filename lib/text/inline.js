/*
 *  text/inline.js
 */
"use strict";

const replacer = require('../util/replacer');

const cref_pt = '&#(?:\\d+|x[\\dA-F]+);';

const link_pt = '(?:https?|ftp)://[\\w\\.\\-/~\\?=%&#:;,\\$\\+]+'
              + '|(?:mailto:)?[\\w\\.\\-]+@[\\w\\-]+(?:\\.[\\w\\-]+)+';

const m1      = (`(?: (?: \\*\\*            .*?  \\*\\* )`
                +  `| (?:   '  '            .*?    '  ' )`
                +  `| (?:   %  %            .*?    %  % )`
                +  `| (?: \`\`\`            .*?   \`\`\`)`
                +  `| (?:  \` \`            .*?   \` \` )`
                +  `| (?: \\(\\(            .*?  \\)\\) )`
                +  `| (?:   {  {            .*?    }  } )`
                +  `| (?: \\[\\[ (?!\\[)    .*?  \\]\\] )`
                +  `| & \\w+ (?:\\( [^)]* \\))? (?:{ [^&]*? }|;)  )`);
const m2      = (`(?: (?: \\*\\*  (?:${m1}|.)*?  \\*\\* )`
                +  `| (?:   '  '  (?:${m1}|.)*?    '  ' )`
                +  `| (?:   %  %  (?:${m1}|.)*?    %  % )`
                +  `| (?: \`\`\`  (?:${m1}|.)*?   \`\`\`)`
                +  `| (?:  \` \`  (?:${m1}|.)*?   \` \` )`
                +  `| (?: \\(\\(  (?:${m1}|.)*?  \\)\\) )`
                +  `| (?:   {  {            .*?    }  } )`
                +  `| (?: \\[\\[ (?!\\[)    .*?  \\]\\] )`
                +  `| & \\w+ (?:\\( [^)]* \\))? (?:{ (?:${m1}|.)*? }|;)  )`);
const mark_pt = (`(?: (?: \\*\\*  (?:${m2}|.)*?  \\*\\* )`
                +  `| (?:   '  '  (?:${m2}|.)*?    '  ' )`
                +  `| (?:   %  %  (?:${m2}|.)*?    %  % )`
                +  `| (?: \`\`\`  (?:${m2}|.)*?   \`\`\`)`
                +  `| (?:  \` \`  (?:${m2}|.)*?   \` \` )`
                +  `| (?: \\(\\(  (?:${m2}|.)*?  \\)\\) )`
                +  `| (?:   {  {            .*?    }  } )`
                +  `| (?: \\[\\[ (?!\\[)    .*?  \\]\\] )`
                +  `| & \\w+ (?:\\( [^)]* \\))? (?:{ (?:${m2}|.)*? }|;)  )`)
                .replace(/\s+/g,'');

function strip(str) {
    return str.replace(/<.*?>/g, '')
              .replace(/&gt;/g,  '>')
              .replace(/&lt;/g,  '<')
              .replace(/&quot;/g,'"')
              .replace(/&amp;/g, '&');
}

function cdata(str) {
    return str.replace(/&/g,'&amp;')
              .replace(/"/g,'&quot;')
              .replace(/</g,'&lt;')
              .replace(/>/g,'&gt;');
}

function link(str) {
    let href = str.match(/:/) ? str : 'mailto:' + str;
    return `<a href="${cdata(href)}">${cdata(str)}</a>`;
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

const cref   = replacer(cref_pt, null,   cdata, 'i');
const text   = replacer(link_pt, link,   cref);
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

    let [ , tag, param, value ]
        = str.match(/^&(\w+)(?:\((.*?)\))?(?:{(.*)}|;)$/);
    if (tag == '_') {
        if (! param.match(/^\w+(?:\s+\w+(?:="[^>]*?")?)*$/)) return cdata(str);
        return value == null
                        ? `<${param}>`
                        : `<${param}>${inline(value)}`
                                  + `</${param.replace(/\s.*$/,'')}>`;
    }
    return str;
}

function footnote(str) {

    let note = inline(str);

    return `<sup class="ll-footnote">`
         + `<a id="NOTEREF.1" href="#FOOTNOTE.1" `
            + `title="${cdata(strip(note))}">`
         + `*1</a></sup>`;
}

module.exports = inline;
