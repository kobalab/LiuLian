const assert = require('assert');

const liulian = require('../lib/text/liulian');
const r = {
    _req: {
        config: { home: __dirname + '/data/' },
        pathDir: '/path/',
        fixpath: (path)=>path,
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

    suite('img - 画像を埋め込む', ()=>{
        test('URLが指定できること', ()=>{
            r.text = '#img(path/file.png)\n';
            result = '<img src="path/file.png" alt="">';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('代替文字列が指定できること', ()=>{
            r.text = '#img(path/file.png,代替文字列)\n';
            result = '<img src="path/file.png" alt="代替文字列">';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('リンクが貼れること', ()=>{
            r.text = '#img(path/file.png,代替文字列,link)\n';
            result = '<a href="path/file.png">'
                   + '<img src="path/file.png" alt="代替文字列" '
                   + 'style="border:solid 1px"></a>';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('回り込みが指定できること', ()=>{
            r.text = '#img(path/file.png,代替文字列,left)\n';
            result = '<img src="path/file.png" alt="代替文字列" '
                   + 'style="float:left">';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('位置合わせが指定できること', ()=>{
            r.text = '#img(path/file.png,代替文字列,top)\n';
            result = '<img src="path/file.png" alt="代替文字列" '
                   + 'style="vertical-align:top">';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('枠幅が指定できること', ()=>{
            r.text = '#img(path/file.png,代替文字列,b3)\n';
            result = '<img src="path/file.png" alt="代替文字列" '
                   + 'style="border:solid 3px">';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('枠幅なしが指定できること', ()=>{
            r.text = '#img(path/file.png,代替文字列,link,b0)\n';
            result = '<a href="path/file.png">'
                   + '<img src="path/file.png" alt="代替文字列" '
                   + 'style="border:none"></a>';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('幅が指定できること', ()=>{
            r.text = '#img(path/file.png,代替文字列,w32)\n';
            result = '<img src="path/file.png" alt="代替文字列" '
                   + 'style="width:32px">';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('高さが指定できること', ()=>{
            r.text = '#img(path/file.png,代替文字列,h24)\n';
            result = '<img src="path/file.png" alt="代替文字列" '
                   + 'style="height:24px">';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('幅と高さが指定できること', ()=>{
            r.text = '#img(path/file.png,代替文字列,32x24)\n';
            result = '<img src="path/file.png" alt="代替文字列" '
                   + 'style="width:32px;height:24px">';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('CSSが指定できること', ()=>{
            r.text = '#img(path/file.png,代替文字列,opacity:0.8)\n';
            result = '<img src="path/file.png" alt="代替文字列" '
                   + 'style="opacity:0.8">';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('インラインでも使用できること', ()=>{
            r.text = '&img(path/file.png);\n';
            result = '<p><img src="path/file.png" alt=""></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });

    suite('color - 文字の色を変える', ()=>{
        test('文字色が指定できること', ()=>{
            r.text = '&color(red){文字色};\n';
            result = '<p><span style="color:red;">文字色</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('背景色が指定できること', ()=>{
            r.text = '&color(,red){背景色};\n';
            result = '<p><span style="background:red;display:inline-block;'
                   + 'padding:1px 2px;">背景色</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('縁取色が指定できること', ()=>{
            r.text = '&color(,,red){縁取色};\n';
            result = '<p><span style="border:solid 1px red;'
                   + 'display:inline-block;padding:1px 2px;'
                   + 'border-radius:2px;">縁取色</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });

    suite('size - 文字の大きさを変える', ()=>{
        test('文字サイズが指定できること', ()=>{
            r.text = '&size(18px){サイズ};\n';
            result = '<p><span style="font-size:18px">サイズ</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });

    suite('br - 改行する', ()=>{
        test('改行できること', ()=>{
            r.text = '改行&br;する\n';
            result = '<p>改行<br>する</p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });
});
