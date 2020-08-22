const assert = require('assert');
const fs     = require('fs');

const msg_file = __dirname + '/data/msg';

const msg_text = [
    '#comment: この行はコメントです。',
    'p0:このメッセージにはパラメータがありません。\r',
    '',
    'p1:param="{$1}"',
    'p2:param2="{$2}", param1="{$1}"',
]
fs.writeFileSync(msg_file, msg_text.join('\n'), 'utf-8');

suite('util/msg', ()=>{
    test('モジュールが存在すること', ()=>{
        const msg = require('../lib/util/msg');
        assert.ok(msg);
    });
    test('パラメータ付きでモジュールを導入できること', ()=>{
        const msg = require('../lib/util/msg')(msg_file);
        assert.ok(msg);
    });

    suite('msg()', ()=>{
        const msg = require('../lib/util/msg')(msg_file);
        test('パラメータなし', ()=>{
            assert.equal(msg('p0'), 'このメッセージにはパラメータがありません。');
        });
        test('パラメータが1つ', ()=>{
            assert.equal(msg('p1', 'A'), 'param="A"');
        });
        test('パラメータが2つ', ()=>{
            assert.equal(msg('p2', 'A', 'B'), 'param2="B", param1="A"');
        });
        test('対応するキーがない', ()=>{
            assert.equal(msg('#comment'), '#comment');
        });
    });
});
