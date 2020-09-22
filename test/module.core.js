const assert = require('assert');

const liulian = require('../lib/text/liulian');
const r = {
    _req: {
        config: { home: __dirname + '/data/' },
        pathDir: '/path/'
    },
    _title: null,
    title(title) { this._title = title },
};
let result;

suite('module/core', ()=>{

    suite('title - HTMLのタイトルを指定する', ()=>{
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

    suite('contentss - 目次を作成する', ()=>{
        test('目次が作成されること', ()=>{
            r.text = '#contents\n* 見出し1\n** 見出し2[anchor]\n';
            result = '<div class="l-contents">\n'
                   + '<ul>\n'
                   + '<li><a href="#l-sec.1">見出し1</a>\n'
                   + '<ul>\n<li><a href="#anchor">見出し2</a></li>\n</ul></li>\n'
                   + '</ul>\n'
                   + '</div>\n\n'
                   + '<h2 id="l-sec.1">見出し1</h2>\n\n'
                   + '<h3 id="anchor">見出し2</h3>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });

    suite('include - 別のファイルを読み込む', ()=>{
        test('ファイルを読み込んで処理すること', ()=>{
            r.text = '#include(file)\n';
            result = '<h1>タイトル</h1>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('相対パスでもファイルを読み込んで処理できること', ()=>{
            r.text = '#include(../path/file)\n';
            result = '<h1>タイトル</h1>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('絶対パスでもファイルを読み込んで処理できること', ()=>{
            r.text = '#include(/path/file)\n';
            result = '<h1>タイトル</h1>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('ファイルが存在しない場合エラーとなること', ()=>{
            r.text = '#include(../file)\n';
            result = '<div style="color:red">#include(../file)</div>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('ファイルがLiuLian形式でない場合エラーとなること', ()=>{
            r.text = '#include(file.txt)\n';
            result = '<div style="color:red">#include(file.txt)</div>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });
});
