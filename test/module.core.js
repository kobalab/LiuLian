const assert = require('assert');

const liulian = require('../lib/text/liulian');
const r = {
    _title: null,
    title(title) { this._title = title },
};
let result;

suite('module/core', ()=>{

    suite('title', ()=>{
        test('HTMLのタイトルが変更されること', ()=>{
            r.text = '#title(Title)\n! タイトル\n';
            return liulian(r).then(html=>assert.equal(r._title, 'Title'));
        });
        test('文書のタイトルは変更されないこと', ()=>{
            r.text = '#title(Title)\n! タイトル\n';
            result = '<h1>タイトル</h1>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('$$ に文書のタイトルが埋め込まれること', ()=>{
            r.text = '#title(Title: $$)\n! タイトル\n';
            return liulian(r).then(html=>
                assert.equal(r._title, 'Title: タイトル'));
        });
        test('最後に指定されたものが有効になること', ()=>{
            r.text = '#title(Title: $$)\n! タイトル\n#title(TITLE: $$)\n';
            return liulian(r).then(html=>
                assert.equal(r._title, 'TITLE: タイトル'));
        });
    });
});
