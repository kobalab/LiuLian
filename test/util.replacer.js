const assert   = require('assert');
const replacer = require('../lib/util/replacer');

const pattern = '&(?:\\w+|#[\\d]+|#x[\\da-f]+);';

function cref(str) { return `<${str}>`}

function escape(str) {
    return str.replace(/&/g,'&amp;')
              .replace(/"/g,'&quot;')
              .replace(/</g,'&lt;')
              .replace(/>/g,'&gt;');
}

const str = '&copy;<&#1234;&#x567F;>';

suite('util/replacer', ()=>{
    test('モジュールが存在すること', ()=>assert.ok(replacer));
    test('置換できること', ()=>{
        const replace = replacer(pattern, cref, escape, 'i');
        assert.equal(replace(str), '<&copy;>&lt;<&#1234;><&#x567F;>&gt;');
    });
    test('一致の場合置換なし', ()=>{
        const replace = replacer(pattern, null, escape, 'i');
        assert.equal(replace(str), '&copy;&lt;&#1234;&#x567F;&gt;');
    });
    test('不一致の場合置換なし', ()=>{
        const replace = replacer(pattern, cref, null, 'i');
        assert.equal(replace(str), '<&copy;><<&#1234;><&#x567F;>>');
    });
    test('置換オプションなし', ()=>{
        const replace = replacer(pattern, cref, escape);
        assert.equal(replace(str), '<&copy;>&lt;<&#1234;>&amp;#x567F;&gt;');
    });
    test('置換対象文字列なし', ()=>{
        const replace = replacer(pattern, cref, escape, 'i');
        assert.equal(replace(), '');
    });
});
