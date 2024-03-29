const assert = require('assert');

const liulian = require('../lib/text/liulian');

function resource(text, url = '/path/') {
    const r = {
        _req: {
            config: { home: __dirname + '/data/' },
            path:    url,
            pathDir: url.replace(/[^\/]*$/,''),
            baseUrl: '/base',
            param() {},
            openFile() {},
        },
        text: text,
        location: url,
        openFile: require('../lib/resource'),
        _: {},
        title(title) { this._.title = title },
        stylesheet(...arg) { this._.stylesheet = arg },
        style(text) { this._.style = text },
        icon(url) { this._.icon = url },
        lang(lang) { this._.lang = lang },
        meta(attr) { this._.meta = attr },
        script(script) { this._.script = script }
    };
    return r;
}
let r, result;

suite('module/core', ()=>{

    suite('title - HTMLのタイトルを指定する', ()=>{
        test('HTMLのタイトルが変更されること', ()=>{
            r = resource('#title(Title)\n! タイトル\n');
            return liulian(r).then(html=>assert.equal(r._.title, 'Title'));
        });
        test('文書のタイトルは変更されないこと', ()=>{
            r = resource('#title(Title)\n! タイトル\n');
            result = '<h1>タイトル</h1>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('$$ に文書のタイトルが埋め込まれること', ()=>{
            r = resource('#title(Title: $$)\n! タイトル\n');
            return liulian(r).then(html=>
                assert.equal(r._.title, 'Title: タイトル'));
        });
        test('最後に指定されたものが有効になること', ()=>{
            r = resource('#title(Title: $$)\n! タイトル\n#title(TITLE: $$)\n');
            return liulian(r).then(html=>
                assert.equal(r._.title, 'TITLE: タイトル'));
        });
    });

    suite('contentss - 目次を作成する', ()=>{
        test('目次が作成されること', ()=>{
            r = resource('#contents\n* 見出し1\n** 見出し2[anchor]\n');
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
        test('すでに登場済の見出しは目次に含めないこと', ()=>{
            r = resource('* 見出し1\n#contents\n* 見出し2\n');
            result = '<h2 id="l-sec.1">見出し1</h2>\n\n'
                   + '<div class="l-contents">\n'
                   + '<ul>\n'
                   + '<li><a href="#l-sec.2">見出し2</a></li>\n'
                   + '</ul>\n'
                   + '</div>\n\n'
                   + '<h2 id="l-sec.2">見出し2</h2>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('「ブロック外」の見出しは目次に含めないこと', ()=>{
            r = resource('#class(class)<<++\n'
                        + '#contents\n* 見出し1\n++\n* 見出し2\n');
            result = '<div class="class">\n'
                   + '<div class="l-contents">\n'
                   + '<ul>\n'
                   + '<li><a href="#l-sec.1">見出し1</a></li>\n'
                   + '</ul>\n'
                   + '</div>\n\n'
                   + '<h2 id="l-sec.1">見出し1</h2>\n'
                   + '</div>\n\n'
                   + '<h2 id="l-sec.2">見出し2</h2>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('目次のレベルを変更できること', ()=>{
            r = resource('#contents(2)\n** 見出し\n');
            result = '<div class="l-contents">\n'
                   + '<ul>\n'
                   + '<li><a href="#l-sec.1">見出し</a></li>\n'
                   + '</ul>\n'
                   + '</div>\n\n'
                   + '<h3 id="l-sec.1">見出し</h3>\n\n'
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('目次の範囲を変更できること', ()=>{
            r = resource('#contents(2,2)\n* 見出し1\n** 見出し2\n*** 見出し3\n');
            result = '<div class="l-contents">\n'
                   + '<ul>\n'
                   + '<li><a href="#l-sec.2">見出し2</a></li>\n'
                   + '</ul>\n'
                   + '</div>\n\n'
                   + '<h2 id="l-sec.1">見出し1</h2>\n\n'
                   + '<h3 id="l-sec.2">見出し2</h3>\n\n'
                   + '<h4 id="l-sec.3">見出し3</h4>\n\n'
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('最終レベルの表示方法を変更できること', ()=>{
            r = resource('#contents(1,2,\\)\n');
            return liulian(r).then(html=>
                    assert.equal(r._.style,
                                '.l-contents li li { display: inline-block; }\n'
                              + '.l-contents li li + li:before'
                                + ' { content: \' \\\\ \'; }\n'));
        });
    });

    suite('nav - ナビゲーション用のリンクを生成する', ()=>{
        test('ナビゲーション用のリンクを生成すること', ()=>{
            r = resource('#nav(toc)', '/nav/content');
            result = '<div class="l-nav">\n'
                   + '<div class="l-nav-prev"><a href="./">TOP</a></div>\n'
                   + '<div class="l-nav-next"><a href="other">other</a></div>\n'
                   + '</div>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('最初のページの場合', ()=>{
            r = resource('#nav(toc)', '/nav/index');
            result = '<div class="l-nav">\n'
                   + '<div class="l-nav-next"><a href="content">'
                        + 'content</a></div>\n'
                   + '</div>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('最後のページの場合', ()=>{
            r = resource('#nav(toc)', '/nav/toc');
            result = '<div class="l-nav">\n'
                   + '<div class="l-nav-prev"><a href="other">other</a></div>\n'
                   + '</div>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('目次へのリンクあり(URL省略)', ()=>{
            r = resource('#nav(toc,TOC)', '/nav/content');
            result = '<div class="l-nav">\n'
                   + '<div class="l-nav-prev"><a href="./">TOP</a></div>\n'
                   + '<div class="l-nav-next"><a href="other">other</a></div>\n'
                   + '<div class="l-nav-top"><a href="toc">TOC</a></div>\n'
                   + '</div>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('目次へのリンクあり(URL指定)', ()=>{
            r = resource('#nav(toc,TOC,./)', '/nav/content');
            result = '<div class="l-nav">\n'
                   + '<div class="l-nav-prev"><a href="./">TOP</a></div>\n'
                   + '<div class="l-nav-next"><a href="other">other</a></div>\n'
                   + '<div class="l-nav-top"><a href="./">TOC</a></div>\n'
                   + '</div>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('ナビゲーション対象外', ()=>{
            r = resource('#nav(toc)', '/nav/other');
            result = '';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('目次ページにリンクなし', ()=>{
            r = resource('#nav(content)', '/nav/content');
            result = '';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('目次ページが存在しない', ()=>{
            r = resource('#nav(other)', '/nav/content');
            result = '<div style="color:red">#nav(other)</div>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('目次ページがLiuLian形式でない', ()=>{
            r = resource('#nav(/path/file.txt)', '/nav/content');
            result = '<div style="color:red">#nav(/path/file.txt)</div>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('目次ページの指定なし', ()=>{
            r = resource('#nav()', '/nav/content');
            result = '<div style="color:red">#nav()</div>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });

    suite('footnote - 脚注を表示する', ()=>{
        test('脚注が表示されること', ()=>{
            r = resource('((脚注1))\n#footnote\n((脚注2))\n');
            result = '<p><sup class="l-footnote">'
                   + '<a id="l-noteref.1" href="#l-footnote.1" title="脚注1">'
                   + '*1</a></sup></p>\n\n'
                   + '<div class="l-footnote">\n<ol>\n'
                   + '<li><a id="l-footnote.1" href="#l-noteref.1">'
                        + '^</a> 脚注1</li>\n'
                   + '</ol>\n</div>\n\n'
                   + '<p><sup class="l-footnote">'
                   + '<a id="l-noteref1.1" href="#l-footnote1.1" title="脚注2">'
                   + '*1</a></sup></p>\n\n'
                   + '<div class="l-footnote">\n<ol>\n'
                   + '<li><a id="l-footnote1.1" href="#l-noteref1.1">'
                        + '^</a> 脚注2</li>\n'
                   + '</ol>\n</div>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });

    suite('include - 別のファイルを読み込む', ()=>{
        test('ファイルを読み込んで処理すること', ()=>{
            r = resource('#include(file)\n');
            result = '<h1>タイトル</h1>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('相対パスでもファイルを読み込んで処理できること', ()=>{
            r = resource('#include(../path/file)\n');
            result = '<h1>タイトル</h1>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('絶対パスでもファイルを読み込んで処理できること', ()=>{
            r = resource('#include(/path/file)\n');
            result = '<h1>タイトル</h1>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('ファイルが存在しない場合エラーとなること', ()=>{
            r = resource('#include(../file)\n');
            result = '<div style="color:red">#include(../file)</div>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('ファイルがLiuLian形式でない場合エラーとなること', ()=>{
            r = resource('#include(file.txt)\n');
            result = '<div style="color:red">#include(file.txt)</div>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });

    suite('img - 画像を埋め込む', ()=>{
        test('URLが指定できること', ()=>{
            r = resource('#img(file.png)\n');
            result = '<img src="file.png" alt="">';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('URLには多バイト文字も指定できること', ()=>{
            r = resource('#img(/画像.png)\n');
            result = '<img src="/base/%E7%94%BB%E5%83%8F.png" alt="">';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('代替文字列が指定できること', ()=>{
            r = resource('#img(file.png,代替文字列)\n');
            result = '<img src="file.png" alt="代替文字列">';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('代替文字列に文字参照が指定できること', ()=>{
            r = resource('#img(file.png,&copy;)\n');
            result = '<img src="file.png" alt="&copy;">';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('リンクが貼れること', ()=>{
            r = resource('#img(file.png,代替文字列,link)\n');
            result = '<a href="file.png">'
                   + '<img src="file.png" alt="代替文字列" '
                   + 'style="border:solid 1px"></a>';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('回り込みが指定できること', ()=>{
            r = resource('#img(file.png,代替文字列,left)\n');
            result = '<img src="file.png" alt="代替文字列" '
                   + 'style="float:left">';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('位置合わせが指定できること', ()=>{
            r = resource('#img(file.png,代替文字列,top)\n');
            result = '<img src="file.png" alt="代替文字列" '
                   + 'style="vertical-align:top">';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('枠幅が指定できること', ()=>{
            r = resource('#img(file.png,代替文字列,b3)\n');
            result = '<img src="file.png" alt="代替文字列" '
                   + 'style="border:solid 3px">';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('枠幅なしが指定できること', ()=>{
            r = resource('#img(file.png,代替文字列,link,b0)\n');
            result = '<a href="file.png">'
                   + '<img src="file.png" alt="代替文字列" '
                   + 'style="border:none"></a>';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('幅が指定できること', ()=>{
            r = resource('#img(file.png,代替文字列,w32)\n');
            result = '<img src="file.png" alt="代替文字列" '
                   + 'style="width:32px">';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('高さが指定できること', ()=>{
            r = resource('#img(file.png,代替文字列,h24)\n');
            result = '<img src="file.png" alt="代替文字列" '
                   + 'style="height:24px">';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('幅と高さが指定できること', ()=>{
            r = resource('#img(file.png,代替文字列,32x24)\n');
            result = '<img src="file.png" alt="代替文字列" '
                   + 'style="width:32px;height:24px">';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('CSSが指定できること', ()=>{
            r = resource('#img(file.png,代替文字列,opacity:0.8)\n');
            result = '<img src="file.png" alt="代替文字列" '
                   + 'style="opacity:0.8">';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('インラインでも使用できること', ()=>{
            r = resource('&img(file.png);\n');
            result = '<p><img src="file.png" alt=""></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });

    suite('color - 文字の色を変える', ()=>{
        test('文字色が指定できること', ()=>{
            r = resource('&color(red){文字色};\n');
            result = '<p><span style="color:red;">文字色</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('背景色が指定できること', ()=>{
            r = resource('&color(,red){背景色};\n');
            result = '<p><span style="background:red;display:inline-block;'
                   + 'padding:1px 2px;">背景色</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('縁取色が指定できること', ()=>{
            r = resource('&color(,,red){縁取色};\n');
            result = '<p><span style="border:solid 1px red;'
                   + 'display:inline-block;padding:1px 2px;'
                   + 'border-radius:2px;">縁取色</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('文字飾りが使えること', ()=>{
            r = resource('&color(red){**文字色**};\n');
            result = '<p><span style="color:red;"><strong>'
                   + '文字色</strong></span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });

    suite('size - 文字の大きさを変える', ()=>{
        test('文字サイズが指定できること', ()=>{
            r = resource('&size(18px){サイズ};\n');
            result = '<p><span style="font-size:18px">サイズ</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('文字飾りが使えること', ()=>{
            r = resource('&size(18px){**サイズ**};\n');
            result = '<p><span style="font-size:18px"><strong>'
                   + 'サイズ</strong></span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('ブロックでも使えること', ()=>{
            r = resource('#size(90%)<<++\nサイズ\n++\n');
            result = '<div style="font-size:90%">\n'
                   + '<p>サイズ</p>\n'
                   + '</div>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });

    suite('br - 改行する', ()=>{
        test('改行できること', ()=>{
            r = resource('改行&br;する\n');
            result = '<p>改行<br>する</p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });

    suite('clear - 文字の回り込みを解除する', ()=>{
        test('文字の回り込みを解除できること', ()=>{
            r = resource('#clear(left)\n#clear\n&clear(right);&clear;\n');
            result = '<div style="clear:left"></div>\n\n'
                   + '<div style="clear:both"></div>\n\n'
                   + '<p><br style="clear:right">'
                        + '<br style="clear:both"></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });

    suite('class - スタイルシート用のクラスを定義する', ()=>{
        test('クラスが定義できること', ()=>{
            r = resource('#class(name)<<++\nクラス\n++\n&class(name){クラス};\n');
            result = '<div class="name">\n<p>クラス</p>\n</div>\n\n'
                   + '<p><span class="name">クラス</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });

    suite('style - スタイルシートを指定する', ()=>{
        test('スタイルシートが指定できること', ()=>{
            r = resource('#style(/url)\n');
            return liulian(r).then(html=>
                        assert.deepEqual(r._.stylesheet,
                                        ['/url', undefined]));
        });
        test('スタイルシートの media が指定できること', ()=>{
            r = resource('#style(url, media)\n');
            return liulian(r).then(html=>
                        assert.deepEqual(r._.stylesheet,
                                        ['url','media']));
        });
        test('スタイルを展開できること', ()=>{
            r = resource('#style<<++\nbody { color: #333; }\n++\n');
            return liulian(r).then(html=>
                    assert.equal(r._.style, 'body { color: #333; }\n'));
        });
        test('行末の \\ を連結しないこと', ()=>{
            r = resource('#style<<++\n'
                            + '  p:after { content: \'Hello,\\\n'
                            + '  world.\'; }\n'
                            + '++\n');
            return liulian(r).then(html=>
                    assert.equal(r._.style,
                                 '  p:after { content: \'Hello,\\\n'
                                    + '  world.\'; }\n'));
        });
    });

    suite('icon - アイコンを指定する', ()=>{
        test('アイコンが指定できること', ()=>{
            r = resource('#icon(/url)\n');
            return liulian(r).then(html=>assert.equal(r._.icon, '/url'));
        });
    });

    suite('lang - コンテンツの言語を指定する', ()=>{
        test('文書全体の言語が指定できること', ()=>{
            r = resource('#lang(ja)\n');
            return liulian(r).then(html=>assert.equal(r._.lang, 'ja'));
        });
        test('指定範囲の言語が指定できること', ()=>{
            r = resource('#lang(ja)<<++\n日本語\n++\n&lang(ja){日本語};\n');
            result = '<div lang="ja">\n<p>日本語</p>\n</div>\n\n'
                   + '<p><span lang="ja">日本語</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });

    suite('redirect - 指定したURLにリダイレクトする', ()=>{
        test('即時指定', ()=>{
            r = resource('#redirect(/url)\n');
            return liulian(r).then(html=>assert.deepEqual(
                r._.meta, {'http-equiv':'refresh','content':'0; URL=/url'}));
        });
        test('秒数指定', ()=>{
            r = resource('#redirect(/url, 5)\n');
            return liulian(r).then(html=>assert.deepEqual(
                r._.meta, {'http-equiv':'refresh','content':'5; URL=/url'}));
        });
    });

    suite('script - JavaScriptを使う', ()=>{
        test('外部スクリプトを指定できること', ()=>{
            r = resource('#script(/url)\n');
            return liulian(r).then(html=>assert.equal(r._.script.url, '/url'));
        });
        test('スクリプトを展開できること', ()=>{
            r = resource('#script<<++\nvar a = 1 + 2;\n++\n');
            return liulian(r).then(html=>
                    assert.equal(r._.script.code, 'var a = 1 + 2;\n'));
        });
        test('行末の \\ を連結しないこと', ()=>{
            r = resource('#script<<++\n'
                            + 'console.log(\'Hello,\\\n'
                            + '  world.\');\n'
                            + '++\n');
            return liulian(r).then(html=>
                    assert.equal(r._.script.code,
                                 'console.log(\'Hello,\\\n'
                                    + '  world.\');\n'));
        });
    });
});
