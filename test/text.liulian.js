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

    suite('見出し (h2 ~ h6)', ()=>{
        test('行頭の * は見出しになる', ()=>{
            r.text = '* 見出し\n';
            result = '<h2 id="l-sec.1">見出し</h2>\n\n';
            assert.equal(liulian(r), result);
        });
        test('見出しは最大5レベル', ()=>{
            r.text = '** 見出し1\n'
                   + '*** 見出し2\n'
                   + '**** 見出し3\n'
                   + '***** 見出し4\n'
                   + '****** 見出し5\n';
            result = '<h3 id="l-sec.1">見出し1</h3>\n\n'
                   + '<h4 id="l-sec.2">見出し2</h4>\n\n'
                   + '<h5 id="l-sec.3">見出し3</h5>\n\n'
                   + '<h6 id="l-sec.4">見出し4</h6>\n\n'
                   + '<h6 id="l-sec.5">見出し5</h6>\n\n';
            assert.equal(liulian(r), result);
        });
        test('見出しは連結しない', ()=>{
            r.text = '* 見出しは\n連結しない\n';
            result = '<h2 id="l-sec.1">見出しは</h2>\n\n<p>連結しない</p>\n\n';
            assert.equal(liulian(r), result);
        });
        test('見出しにリンクを貼ることもできる', ()=>{
            r.text = '* [[見出し|./]]\n';
            result = '<h2 id="l-sec.1"><a href="./">見出し</a></h2>\n\n';
            assert.equal(liulian(r), result);
        });
        test('見出しは段落を終了させる', ()=>{
            r.text = '段落\n* 見出し\n';
            result = '<p>段落</p>\n\n<h2 id="l-sec.1">見出し</h2>\n\n';
            assert.equal(liulian(r), result);
        });
        test('アンカー名は指定可能', ()=>{
            r.text = '* 見出し [anchor]\n';
            result = '<h2 id="anchor">見出し</h2>\n\n';
            assert.equal(liulian(r), result);
        });
    });

    suite('水平線 (hr)', ()=>{
        test('- だけの行は水平線になる', ()=>{
            r.text = '-\n--\n';
            result = '<hr>\n\n<hr>\n\n';
            assert.equal(liulian(r), result);
        });
        test('水平線は段落を終了させる', ()=>{
            r.text = '段落\n-\n';
            result = '<p>段落</p>\n\n<hr>\n\n';
            assert.equal(liulian(r), result);
        });
    });

    suite('箇条書き (ul, ol)', ()=>{
        test('行頭が - で黒丸リスト', ()=>{
            r.text = '-リスト\n- リスト\n';
            result = '<ul>\n<li>リスト</li>\n<li>リスト</li>\n</ul>\n\n';
            assert.equal(liulian(r), result);
        });
        test('行頭が + で数字リスト', ()=>{
            r.text = '+リスト\n+ リスト\n';
            result = '<ol>\n<li>リスト</li>\n<li>リスト</li>\n</ol>\n\n';
            assert.equal(liulian(r), result);
        });
        test('連続した行は連結される', ()=>{
            r.text = '-連続した行は\n連結される。\n';
            result = '<ul>\n<li>連続した行は\n連結される。</li>\n</ul>\n\n';
            assert.equal(liulian(r), result);
        });
        test('行末の ~ は改行になる', ()=>{
            r.text = '-行末の ~ は~\n改行になる。~\n';
            result = '<ul>\n<li>行末の ~ は<br>\n改行になる。<br></li>\n</ul>\n\n';
            assert.equal(liulian(r), result);
        });
        test('入れ子のリスト', ()=>{
            r.text = '-リスト1\n--リスト2\n-リスト3\n';
            result = '<ul>\n<li>リスト1\n'
                   + '<ul>\n<li>リスト2</li>\n'
                   + '</ul></li>\n'
                   + '<li>リスト3</li>\n</ul>\n\n';
            assert.equal(liulian(r), result);
        });
        test('とび段の入れ子', ()=>{
            r.text = '-リスト1\n---リスト2\n-リスト3\n';
            result = '<ul>\n<li>リスト1\n'
                   + '<ul>\n'
                   + '<li style="display: inline; list-style-type: none;">\n'
                   + '<ul>\n<li>リスト2</li>\n'
                   + '</ul></li>\n'
                   + '</ul></li>\n'
                   + '<li>リスト3</li>\n</ul>\n\n';
            assert.equal(liulian(r), result);
        });
        test('異種の入れ子', ()=>{
            r.text = '-リスト1\n++リスト2\n-リスト3\n';
            result = '<ul>\n<li>リスト1\n'
                   + '<ol>\n<li>リスト2</li>\n'
                   + '</ol></li>\n'
                   + '<li>リスト3</li>\n</ul>\n\n';
            assert.equal(liulian(r), result);
        });
        test('異種の隣接', ()=>{
            r.text = '-リスト1\n--リスト2\n++リスト3\n+リスト4\n-リスト5\n';
            result = '<ul>\n<li>リスト1\n'
                   + '<ul>\n<li>リスト2</li>\n'
                   + '</ul>\n'
                   + '<ol>\n<li>リスト3</li>\n'
                   + '</ol></li>\n'
                   + '</ul>\n\n'
                   + '<ol>\n<li>リスト4</li>\n</ol>\n\n'
                   + '<ul>\n<li>リスト5</li>\n</ul>\n\n';
            assert.equal(liulian(r), result);
        });
        test('箇条書きは段落を終了させる', ()=>{
            r.text = '段落\n+リスト\n';
            result = '<p>段落</p>\n\n<ol>\n<li>リスト</li>\n</ol>\n\n';
            assert.equal(liulian(r), result);
        });
        test('空行で箇条書きは終了する', ()=>{
            r.text = '+リスト\n\n段落\n';
            result = '<ol>\n<li>リスト</li>\n</ol>\n\n<p>段落</p>\n\n';
            assert.equal(liulian(r), result);
        });
        test('段落で箇条書きは終了する', ()=>{
            r.text = '+リスト\n~段落\n';
            result = '<ol>\n<li>リスト</li>\n</ol>\n\n<p>段落</p>\n\n';
            assert.equal(liulian(r), result);
        });
        test('水平線で箇条書きは終了する', ()=>{
            r.text = '+リスト\n--\n';
            result = '<ol>\n<li>リスト</li>\n</ol>\n\n<hr>\n\n';
            assert.equal(liulian(r), result);
        });
    });

    suite('用語説明 (dl)', ()=>{
        test('行頭の : は用語説明になる', ()=>{
            r.text = ':用語\n説明\n:用語\n説明\n';
            result = '<dl>\n<dt>用語</dt>\n<dd>説明</dd>\n'
                   + '<dt>用語</dt>\n<dd>説明</dd>\n</dl>\n\n';
            assert.equal(liulian(r), result);
        });
        test('説明の連続した行は連結される', ()=>{
            r.text = ':用語\n説明\n説明\n';
            result = '<dl>\n<dt>用語</dt>\n<dd>説明\n説明</dd>\n</dl>\n\n';
            assert.equal(liulian(r), result);
        });
        test('説明の行末の ~ は改行になる', ()=>{
            r.text = ':用語\n説明~\n説明\n';
            result = '<dl>\n<dt>用語</dt>\n<dd>説明<br>\n説明</dd>\n</dl>\n\n';
            assert.equal(liulian(r), result);
        });
        test('用語は連続できる', ()=>{
            r.text = ':用語1\n:用語2\n説明\n';
            result = '<dl>\n<dt>用語1</dt>\n'
                   + '<dt>用語2</dt>\n<dd>説明</dd>\n</dl>\n\n';
            assert.equal(liulian(r), result);
        });
        test(': だけの行は説明の段落区切りになる', ()=>{
            r.text = ':用語\n説明\n:\n説明\n';
            result = '<dl>\n<dt>用語</dt>\n<dd>説明</dd>\n'
                   + '<dd>説明</dd>\n</dl>\n\n';
            assert.equal(liulian(r), result);
        });
        test('空行で用語説明は終了する', ()=>{
            r.text = ':用語\n説明\n\n段落\n'
                   + ':用語\n\n段落\n';
            result = '<dl>\n<dt>用語</dt>\n<dd>説明</dd>\n</dl>\n\n'
                   + '<p>段落</p>\n\n'
                   + '<dl>\n<dt>用語</dt>\n</dl>\n\n'
                   + '<p>段落</p>\n\n';
            assert.equal(liulian(r), result);
        });
        test('段落で用語説明は終了する', ()=>{
            r.text = ':用語\n説明\n~段落\n'
                   + ':用語\n~段落\n';
            result = '<dl>\n<dt>用語</dt>\n<dd>説明</dd>\n</dl>\n\n'
                   + '<p>段落</p>\n\n'
                   + '<dl>\n<dt>用語</dt>\n</dl>\n\n'
                   + '<p>段落</p>\n\n';
            assert.equal(liulian(r), result);
        });
    });

    suite('整形済みテキスト (pre)', ()=>{
        test('行頭が空白文字の場合、整形済みテキストになる', ()=>{
            r.text = ' 整形済み\n';
            result = '<pre>整形済み</pre>\n\n';
            assert.equal(liulian(r), result);
        });
        test('先頭が空白文字である限り、整形済みテキストを継続する', ()=>{
            r.text = ' 整形済み\n 継続\n段落\n';
            result = '<pre>整形済み\n継続</pre>\n\n<p>段落</p>\n\n';
            assert.equal(liulian(r), result);
        });
        test('>| と |< で囲まれた部分も整形済みテキストになる', ()=>{
            r.text = '>|\n! 整形済み\n* 継続\n|<\n';
            result = '<pre>! 整形済み\n* 継続</pre>\n\n';
            assert.equal(liulian(r), result);
        });
        test('>|| と ||< で囲まれた整形済みテキストでは文字飾りが使用可能', ()=>{
            r.text = '>||\n! **整形済み**\n* 継続\n||<\n';
            result = '<pre>! <strong>整形済み</strong>\n* 継続</pre>\n\n';
            assert.equal(liulian(r), result);
        });
    });

    suite('引用 (blockquote)', ()=>{
        test('>> と << で囲まれた部分は引用になる', ()=>{
            r.text = '>>\n引用\n継続\n<<\n';
            result = '<blockquote>\n<p>引用\n継続</p>\n</blockquote>\n\n';
            assert.equal(liulian(r), result);
        });
        test('引用内には箇条書きも記述可能', ()=>{
            r.text = '>>\n引用\n-リスト\n<<\n';
            result = '<blockquote>\n<p>引用</p>\n\n'
                   + '<ul>\n<li>リスト</li>\n</ul>\n</blockquote>\n\n';
            assert.equal(liulian(r), result);
        });
        test('引用は入れ子にできる', ()=>{
            r.text = '>>\n引用\n>>\n入れ子\n<<\n<<\n';
            result = '<blockquote>\n<p>引用</p>\n\n'
                   + '<blockquote>\n<p>入れ子</p>\n</blockquote>\n'
                   + '</blockquote>\n\n';
            assert.equal(liulian(r), result);
        });
    });
});
