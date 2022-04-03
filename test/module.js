const assert = require('assert');
const fs     = require('fs');
const path   = require('path');

const Module = require('../lib/module');
const parser = { _r: { _req: {} } };
let m;

suite('module', ()=>{

    test('モジュールが存在すること', ()=>assert.ok(Module));

    suite('constructor()', ()=>{
        test('インスタンスが生成できること', ()=>{
            assert.ok(m = new Module(parser));
        });
    });
    suite('.import()', ()=>{
        const CONSOLE_LOG = console.log;
        let _log;
        suiteSetup(()=>{
            console.log = (...param)=>{ _log = param; };
            fs.writeFileSync(path.join(__dirname, '../lib/module/dummy.js'),
                             '', 'utf-8');
        });
        test('importに失敗した場合、ログを出力すること(ファイルなし)', ()=>{
            assert.ifError(m.import('test'));
            assert.equal(_log[0], 'test');
            assert.equal(_log[1], 'MODULE_NOT_FOUND');
        });
        test('importに失敗した場合、ログを出力すること(ファイル不正)', ()=>{
            assert.ifError(m.import('dummy'));
            assert.equal(_log.length, 1);
        });
        suiteTeardown(()=>{
            console.log = CONSOLE_LOG;
            fs.unlinkSync(path.join(__dirname, '../lib/module/dummy.js'));
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
