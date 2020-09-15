const assert = require('assert');

const liulian = require('../lib/text/liulian');
const r = {
    _title: null,
    title(title) { this._title = title },
};
let result;

suite('text.liulian', ()=>{

    test('モジュールが存在すること', ()=>assert.ok(liulian));

    suite('段落 (p)', ()=>{
        test('これは段落になる', ()=>{
            r.text = 'これは段落になる。\n';
            result = '<p>これは段落になる。</p>\n\n';
            assert.equal(liulian(r), result);
        });
        test('連続した行は連結される', ()=>{
            r.text = '連続した行は\n連結される。\n';
            result = '<p>連続した行は\n連結される。</p>\n\n';
            assert.equal(liulian(r), result);
        });
        test('空行が段落の区切りになる', ()=>{
            r.text = '空行が\n\n段落の区切りになる。';
            result = '<p>空行が</p>\n\n<p>段落の区切りになる。</p>\n\n';
            assert.equal(liulian(r), result);
        });
        test('行末の ~ は改行になる', ()=>{
            r.text = '行末の ~ は~\n改行になる。\n';
            result = '<p>行末の ~ は<br>\n改行になる。</p>\n\n';
            assert.equal(liulian(r), result);
        });
        test('行頭の ~ は段落の開始となる', ()=>{
            r.text = '行頭の ~ は\n~段落の開始となる。\n';
            result = '<p>行頭の ~ は</p>\n\n<p>段落の開始となる。</p>\n\n';
            assert.equal(liulian(r), result);
        });
    });

    suite('タイトル (title, h1)', ()=>{
        test('行頭の ! はタイトルになる', ()=>{
            r.text = '! タイトル\n';
            result = '<h1>タイトル</h1>\n\n';
            assert.equal(liulian(r), result);
            assert.equal(r._title, 'タイトル');
        });
        test('タイトルは連結しない', ()=>{
            r.text = '! タイトルは\n連結しない\n';
            result = '<h1>タイトルは</h1>\n\n<p>連結しない</p>\n\n';
            assert.equal(liulian(r), result);
            assert.equal(r._title, 'タイトルは');
        });
        test('後続の ! が文書のタイトルになる', ()=>{
            r.text = '! タイトル1\n! タイトル2\n';
            result = '<h1>タイトル1</h1>\n\n<h1>タイトル2</h1>\n\n';
            assert.equal(liulian(r), result);
            assert.equal(r._title, 'タイトル2');
        });
        test('タイトルにリンクを貼ることもできる', ()=>{
            r.text = '! [[タイトル|./]]\n';
            result = '<h1><a href="./">タイトル</a></h1>\n\n';
            assert.equal(liulian(r), result);
            assert.equal(r._title, 'タイトル');
        });
        test('タイトルは段落を終了させる', ()=>{
            r.text = '段落\n! タイトル\n';
            result = '<p>段落</p>\n\n<h1>タイトル</h1>\n\n';
            assert.equal(liulian(r), result);
        });
    });
});
