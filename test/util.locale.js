const assert = require('assert');
const fs     = require('fs');

const locale_dir = __dirname + '/data/locale/';

for (let lang of [ 'en', 'ja', 'zh-CN' ]) {
    fs.writeFileSync(locale_dir + lang, `Lang:${lang}\n`, 'utf-8');
}

suite('util/locale', ()=>{
    test('モジュールが存在すること', ()=>{
        assert.ok(require('../lib/util/locale'));
    });

    const locale = require('../lib/util/locale')(locale_dir, 'ja');
    test('パラメータ付きでモジュールを導入できること', ()=> assert.ok(locale));

    suite('locale()', ()=>{
        test('パラメータなしの場合、使用可能な言語の一覧を返す', ()=>{
            assert.deepEqual(locale(), [ 'ja', 'en', 'zh-CN' ]);
        });
        test('パラメータが文字列の場合、それにマッチする Msg を返す', ()=>{
            assert.equal(locale('zh-CN')('Lang'), 'zh-CN');
            assert.equal(locale('zh-CN')(), 'zh-CN');
        });
        test('国情報を除いた言語部分だけでもマッチを試みる', ()=>{
            assert.equal(locale('en-US')('Lang'), 'en');
            assert.equal(locale('en-US')(), 'en');
        });
        test('マッチするものがない場合、デフォルトの Msg を返す', ()=>{
            assert.equal(locale('zh-TW')('Lang'), 'ja');
            assert.equal(locale('zh-TW')(), 'ja');
        });
        test('パラメータが配列の場合、順にマッチを試みる', ()=>{
            assert.equal(locale(['zh-TW', 'zh-CN'])('Lang'), 'zh-CN');
            assert.equal(locale(['zh-TW', 'zh-CN'])(), 'zh-CN');
        });
        test('配列の場合も国情報を除いた言語部分だけでもマッチを試みる', ()=>{
            assert.equal(locale(['en-US', 'zh-CN'])('Lang'), 'en');
            assert.equal(locale(['en-US', 'zh-CN'])(), 'en');
        });
        test('配列の場合もマッチするものがない場合、デフォルトの Msg を返す', ()=>{
            assert.equal(locale(['zh-TW', 'de'])('Lang'), 'ja');
            assert.equal(locale(['zh-TW', 'de'])(), 'ja');
        });
    });
});
