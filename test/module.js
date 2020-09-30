const assert = require('assert');

const Module = require('../lib/module');
const parser = { _r: { _req: {} } };
let m;

let _log;
console.log = (err)=>{ _log = err; }

suite('module', ()=>{

    test('モジュールが存在すること', ()=>assert.ok(Module));

    suite('constructor()', ()=>{
        test('インスタンスが生成できること', ()=>{
            assert.ok(m = new Module(parser));
        });
    });
    suite('.import()', ()=>{
        test('importに失敗した場合、ログを出力すること', ()=>{
            assert.ifError(m.import('test'));
            assert.ok(_log);
        });
    });
    suite('.callInlineModule()', ()=>{
        test('指定されたモジュールが存在しない場合、エラー表示すること', ()=>{
            assert.equal(m.callInlineModule('&x();','x','',''),
                                '<span style="color:red">&amp;x();</span>');
        });
        test('存在しないモジュールの表記が実体参照場合、エラー表示しないこと', ()=>{
            assert.equal(m.callInlineModule('&copy;','copy','',''), '&copy;');
        });
    });
    suite('.callBlockModule()', ()=>{
        test('指定されたモジュールが存在しない場合、エラー表示すること', ()=>{
            return m.callBlockModule('#x','x','','').then(html=>
                assert.equal(html, '<div style="color:red">#x</div>\n\n'));
        });
    });
});
