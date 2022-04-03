const assert = require('assert');

const liulian = require('../lib/text/liulian');
const r = {
    _req: { baseUrl: '/base' },
    _title: null,
    title(title) { this._title = title },
};
let result;
const CONSOLE_LOG = console.log;

suite('text/liulian', ()=>{

    test('モジュールが存在すること', ()=>assert.ok(liulian));

    suite('段落 (p)', ()=>{
        test('これは段落になる', ()=>{
            r.text = 'これは段落になる。\n';
            result = '<p>これは段落になる。</p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('連続した行は連結される', ()=>{
            r.text = '連続した行は\n連結される。\n';
            result = '<p>連続した行は\n連結される。</p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('空行が段落の区切りになる', ()=>{
            r.text = '空行が\n\n段落の区切りになる。';
            result = '<p>空行が</p>\n\n<p>段落の区切りになる。</p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('行末の ~ は改行になる', ()=>{
            r.text = '行末の ~ は~\n改行になる。\n';
            result = '<p>行末の ~ は<br>\n改行になる。</p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('行末の \\ は継続行になる', ()=>{
            r.text = '行末の \\ は\\\n継続行になる。\n';
            result = '<p>行末の \\ は継続行になる。</p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('行頭の \\ は捨てられる', ()=>{
            r.text = '行頭の \n\\ は捨てられる。\n';
            result = '<p>行頭の \n は捨てられる。</p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('行頭の ~ は段落の開始となる', ()=>{
            r.text = '行頭の ~ は\n~段落の開始となる。\n';
            result = '<p>行頭の ~ は</p>\n\n<p>段落の開始となる。</p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('行頭の < は左寄せの段落となる', ()=>{
            r.text = '行頭の < は\n<左寄せの段落となる。\n';
            result = '<p>行頭の &lt; は</p>\n\n'
                   + '<p style="text-align: left">左寄せの段落となる。</p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('行頭の = はセンタリングの段落となる', ()=>{
            r.text = '行頭の = は\n=センタリングの段落となる。\n';
            result = '<p>行頭の = は</p>\n\n'
                   + '<p style="text-align: center">センタリングの段落となる。'
                   + '</p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('行頭の > は右寄せの段落となる', ()=>{
            r.text = '行頭の > は\n>右寄せの段落となる。\n';
            result = '<p>行頭の &gt; は</p>\n\n'
                   + '<p style="text-align: right">右寄せの段落となる。</p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('段落内では文字飾りを使うことができる', ()=>{
            r.text = 'これは**段落**になる。\n';
            result = '<p>これは<strong>段落</strong>になる。</p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });

    suite('タイトル (title, h1)', ()=>{
        test('行頭の ! はタイトルになる', ()=>{
            r.text = '! タイトル\n';
            result = '<h1>タイトル</h1>\n\n';
            return liulian(r).then(html=>{
                assert.equal(html, result);
                assert.equal(r._title, 'タイトル');
            });
        });
        test('タイトルは連結しない', ()=>{
            r.text = '! タイトルは\n連結しない\n';
            result = '<h1>タイトルは</h1>\n\n<p>連結しない</p>\n\n';
            return liulian(r).then(html=>{
                assert.equal(html, result);
                assert.equal(r._title, 'タイトルは');
            });
        });
        test('後続の ! が文書のタイトルになる', ()=>{
            r.text = '! タイトル1\n! タイトル2\n';
            result = '<h1>タイトル1</h1>\n\n<h1>タイトル2</h1>\n\n';
            return liulian(r).then(html=>{
                assert.equal(html, result);
                assert.equal(r._title, 'タイトル2');
            });
        });
        test('タイトルにリンクを貼ることもできる', ()=>{
            r.text = '! [[タイトル|/url]]\n';
            result = '<h1><a href="/base/url">タイトル</a></h1>\n\n';
            return liulian(r).then(html=>{
                assert.equal(html, result);
                assert.equal(r._title, 'タイトル');
            });
        });
        test('タイトルは段落を終了させる', ()=>{
            r.text = '段落\n! タイトル\n';
            result = '<p>段落</p>\n\n<h1>タイトル</h1>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });

    suite('見出し (h2 ~ h6)', ()=>{
        test('行頭の * は見出しになる', ()=>{
            r.text = '* 見出し\n';
            result = '<h2 id="l-sec.1">見出し</h2>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
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
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('見出しは連結しない', ()=>{
            r.text = '* 見出しは\n連結しない\n';
            result = '<h2 id="l-sec.1">見出しは</h2>\n\n<p>連結しない</p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('見出しにリンクを貼ることもできる', ()=>{
            r.text = '* [[見出し|/url]]\n';
            result = '<h2 id="l-sec.1"><a href="/base/url">見出し</a></h2>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('見出しは段落を終了させる', ()=>{
            r.text = '段落\n* 見出し\n';
            result = '<p>段落</p>\n\n<h2 id="l-sec.1">見出し</h2>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('アンカー名は指定可能', ()=>{
            r.text = '* 見出し [anchor]\n';
            result = '<h2 id="anchor">見出し</h2>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });

    suite('水平線 (hr)', ()=>{
        test('- だけの行は水平線になる', ()=>{
            r.text = '-\n--\n';
            result = '<hr>\n\n<hr>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('水平線は段落を終了させる', ()=>{
            r.text = '段落\n-\n';
            result = '<p>段落</p>\n\n<hr>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });

    suite('箇条書き (ul, ol)', ()=>{
        test('行頭が - で黒丸リスト', ()=>{
            r.text = '-リスト\n- リスト\n';
            result = '<ul>\n<li>リスト</li>\n<li>リスト</li>\n</ul>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('行頭が + で数字リスト', ()=>{
            r.text = '+リスト\n+ リスト\n';
            result = '<ol>\n<li>リスト</li>\n<li>リスト</li>\n</ol>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('連続した行は連結される', ()=>{
            r.text = '-連続した行は\n連結される。\n';
            result = '<ul>\n<li>連続した行は\n連結される。</li>\n</ul>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('行末の ~ は改行になる', ()=>{
            r.text = '-行末の ~ は~\n改行になる。~\n';
            result = '<ul>\n<li>行末の ~ は<br>\n改行になる。<br></li>\n</ul>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('行頭の \\ は捨てられる', ()=>{
            r.text = '-行頭の \n\\ は捨てられる。\n';
            result = '<ul>\n<li>行頭の \n は捨てられる。</li>\n</ul>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('文字飾りを使うことができる', ()=>{
            r.text = '- **リスト**\n';
            result = '<ul>\n<li><strong>リスト</strong></li>\n</ul>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('入れ子のリスト', ()=>{
            r.text = '-リスト1\n--リスト2\n-リスト3\n';
            result = '<ul>\n<li>リスト1\n'
                   + '<ul>\n<li>リスト2</li>\n'
                   + '</ul></li>\n'
                   + '<li>リスト3</li>\n</ul>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
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
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('異種の入れ子', ()=>{
            r.text = '-リスト1\n++リスト2\n-リスト3\n';
            result = '<ul>\n<li>リスト1\n'
                   + '<ol>\n<li>リスト2</li>\n'
                   + '</ol></li>\n'
                   + '<li>リスト3</li>\n</ul>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
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
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('箇条書きは段落を終了させる', ()=>{
            r.text = '段落\n+リスト\n';
            result = '<p>段落</p>\n\n<ol>\n<li>リスト</li>\n</ol>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('空行で箇条書きは終了する', ()=>{
            r.text = '+リスト\n\n段落\n';
            result = '<ol>\n<li>リスト</li>\n</ol>\n\n<p>段落</p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('段落で箇条書きは終了する', ()=>{
            r.text = '+リスト\n~段落\n';
            result = '<ol>\n<li>リスト</li>\n</ol>\n\n<p>段落</p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('水平線で箇条書きは終了する', ()=>{
            r.text = '+リスト\n--\n';
            result = '<ol>\n<li>リスト</li>\n</ol>\n\n<hr>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });

    suite('用語説明 (dl)', ()=>{
        test('行頭の : は用語説明になる', ()=>{
            r.text = ':用語\n説明\n:用語\n説明\n';
            result = '<dl>\n<dt>用語</dt>\n<dd>説明</dd>\n'
                   + '<dt>用語</dt>\n<dd>説明</dd>\n</dl>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('説明の連続した行は連結される', ()=>{
            r.text = ':用語\n説明\n説明\n';
            result = '<dl>\n<dt>用語</dt>\n<dd>説明\n説明</dd>\n</dl>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('説明の行末の ~ は改行になる', ()=>{
            r.text = ':用語\n説明~\n説明\n';
            result = '<dl>\n<dt>用語</dt>\n<dd>説明<br>\n説明</dd>\n</dl>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('用語は連続できる', ()=>{
            r.text = ':用語1\n:用語2\n説明\n';
            result = '<dl>\n<dt>用語1</dt>\n'
                   + '<dt>用語2</dt>\n<dd>説明</dd>\n</dl>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test(': だけの行は説明の段落区切りになる', ()=>{
            r.text = ':用語\n説明\n:\n説明\n';
            result = '<dl>\n<dt>用語</dt>\n<dd>説明</dd>\n'
                   + '<dd>説明</dd>\n</dl>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('文字飾りを使うことができる', ()=>{
            r.text = ':**用語**\n\'\'説明\'\'\n';
            result = '<dl>\n<dt><strong>用語</strong>'
                   + '</dt>\n<dd><em>説明</em></dd>\n</dl>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('空行で用語説明は終了する', ()=>{
            r.text = ':用語\n説明\n\n段落\n'
                   + ':用語\n\n段落\n';
            result = '<dl>\n<dt>用語</dt>\n<dd>説明</dd>\n</dl>\n\n'
                   + '<p>段落</p>\n\n'
                   + '<dl>\n<dt>用語</dt>\n</dl>\n\n'
                   + '<p>段落</p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('段落で用語説明は終了する', ()=>{
            r.text = ':用語\n説明\n~段落\n'
                   + ':用語\n~段落\n';
            result = '<dl>\n<dt>用語</dt>\n<dd>説明</dd>\n</dl>\n\n'
                   + '<p>段落</p>\n\n'
                   + '<dl>\n<dt>用語</dt>\n</dl>\n\n'
                   + '<p>段落</p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });

    suite('表 (table)', ()=>{
        test('行頭が | の場合、表になる', ()=>{
            r.text = '|テーブル|\n';
            result = '<table>\n<tr><td>テーブル</td></tr>\n</table>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('~ ではじまるセルはヘッダになる', ()=>{
            r.text = '|~ヘッダ|~ヘッダ|\n|セル|セル|\n';
            result = '<table>\n'
                   + '<tr><th>ヘッダ</th><th>ヘッダ</th></tr>\n'
                   + '<tr><td>セル</td><td>セル</td></tr>\n'
                   + '</table>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('- ではじまるセルは左と結合する', ()=>{
            r.text = '|~ヘッダ|~ヘッダ|\n|セル|-|\n';
            result = '<table>\n'
                   + '<tr><th>ヘッダ</th><th>ヘッダ</th></tr>\n'
                   + '<tr><td colspan="2">セル</td></tr>\n'
                   + '</table>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('^ ではじまるセルは上と結合する', ()=>{
            r.text = '|~ヘッダ|セル|\n|^|セル|\n';
            result = '<table>\n'
                   + '<tr><th rowspan="2">ヘッダ</th><td>セル</td></tr>\n'
                   + '<tr><td>セル</td></tr>\n'
                   + '</table>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('結合の複合', ()=>{
            r.text = '|セル|-|\n|^|-|\n';
            result = '<table>\n'
                   + '<tr><td colspan="2" rowspan="2">セル</td></tr>\n'
                   + '<tr></tr>\n'
                   + '</table>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('< = > で左寄せ、センタリング、右寄せを指定できる', ()=>{
            r.text = '|~<ヘッダ|~>ヘッダ|\n|=セル|-|\n';
            result = '<table>\n'
                   + '<tr><th style="text-align:left">ヘッダ</th>'
                        + '<th style="text-align:right">ヘッダ</th></tr>\n'
                   + '<tr><td colspan="2" style="text-align:center">'
                        + 'セル</td></tr>\n'
                   + '</table>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('#fcf の形式で背景色を指定できる', ()=>{
            r.text = '|~<ヘッダ|~>ヘッダ|\n|=#fcf セル|-|\n';
            result = '<table>\n'
                   + '<tr><th style="text-align:left">ヘッダ</th>'
                        + '<th style="text-align:right">ヘッダ</th></tr>\n'
                   + '<tr><td colspan="2" '
                        + 'style="text-align:center;background:#fcf">'
                        + ' セル</td></tr>\n'
                   + '</table>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('.name の形式でclassを指定できる', ()=>{
            r.text = '|~<ヘッダ|~>ヘッダ|\n|=.name セル|-|\n';
            result = '<table>\n'
                   + '<tr><th style="text-align:left">ヘッダ</th>'
                        + '<th style="text-align:right">ヘッダ</th></tr>\n'
                   + '<tr><td colspan="2" class="name" '
                        + 'style="text-align:center">'
                        + ' セル</td></tr>\n'
                   + '</table>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('classは背景色の前に指定する', ()=>{
            r.text = '|.name#123 セル|\n';
            result = '<table>\n'
                   + '<tr><td class="name" style="background:#123"> '
                        + 'セル</td></tr>\n'
                   + '</table>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('classは複数指定できる', ()=>{
            r.text = '|.n-1.n-2.n-3#123 セル|\n';
            result = '<table>\n'
                   + '<tr><td class="n-1 n-2 n-3" style="background:#123"> '
                        + 'セル</td></tr>\n'
                   + '</table>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('文字飾りを使うことができる', ()=>{
            r.text = '|**テーブル**|\n';
            result = '<table>\n'
                   + '<tr><td><strong>テーブル</strong></td></tr>\n'
                   + '</table>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('リンクを使うことができる', ()=>{
            r.text = '|[[テーブル|table]]|\n';
            result = '<table>\n'
                   + '<tr><td><a href="table">テーブル</a></td></tr>\n'
                   + '</table>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('| のみの行も処理できる', ()=>{
            r.text = '|\n';
            result = '<table>\n'
                   + '<tr></tr>\n'
                   + '</table>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });

    suite('整形済みテキスト (pre)', ()=>{
        test('行頭が空白文字の場合、整形済みテキストになる', ()=>{
            r.text = ' 整形済み\n';
            result = '<pre>整形済み</pre>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('先頭が空白文字である限り、整形済みテキストを継続する', ()=>{
            r.text = ' 整形済み\n 継続\n段落\n';
            result = '<pre>整形済み\n継続</pre>\n\n<p>段落</p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('文字飾りは使用できない', ()=>{
            r.text = ' **整形済み**\n';
            result = '<pre>**整形済み**</pre>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('>| と |< で囲まれた部分も整形済みテキストになる', ()=>{
            r.text = '>|\n! 整形済み\n* 継続\n|<\n';
            result = '<pre>! 整形済み\n* 継続</pre>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('文字飾りは使用できない', ()=>{
            r.text = '>|\n**整形済み**\n|<\n';
            result = '<pre>**整形済み**</pre>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('>|bash のように言語を指定するとシンタックス・ハイライトする', ()=>{
            r.text = '>|bash\n$ echo "Hello"\n|<\n';
            result = '<pre><code>$ <span class="hljs-built_in">echo</span> '
                   + '<span class="hljs-string">&quot;Hello&quot;</span>'
                   + '</code></pre>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('言語が不正な場合は推定する', ()=>{
            r.text = '>|_\n$ echo "Hello"\n|<\n';
            result = '<pre><code><span class="hljs-meta">$</span>'
                   + '<span class="bash"> '
                   + '<span class="hljs-built_in">echo</span> '
                   + '<span class="hljs-string">&quot;Hello&quot;</span></span>'
                   + '</code></pre>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('>|| と ||< で囲まれた整形済みテキストでは文字飾りが使用可能', ()=>{
            r.text = '>||\n! **整形済み**\n* 継続\n||<\n';
            result = '<pre>! <strong>整形済み</strong>\n* 継続</pre>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });

    suite('引用 (blockquote)', ()=>{
        test('>> と << で囲まれた部分は引用になる', ()=>{
            r.text = '>>\n引用\n継続\n<<\n';
            result = '<blockquote>\n<p>引用\n継続</p>\n</blockquote>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('引用内には箇条書きも記述可能', ()=>{
            r.text = '>>\n引用\n-リスト\n<<\n';
            result = '<blockquote>\n<p>引用</p>\n\n'
                   + '<ul>\n<li>リスト</li>\n</ul>\n</blockquote>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('引用は入れ子にできる', ()=>{
            r.text = '>>\n引用\n>>\n入れ子\n<<\n<<\n';
            result = '<blockquote>\n<p>引用</p>\n\n'
                   + '<blockquote>\n<p>入れ子</p>\n</blockquote>\n'
                   + '</blockquote>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });

    suite('脚注', ()=>{
        test('(( と )) で囲まれた部分は脚注になる', ()=>{
            r.text = '((脚注1)) ((脚注2))\n';
            result = '<p><sup class="l-footnote">'
                        + '<a id="l-noteref.1" href="#l-footnote.1" '
                            + 'title="脚注1">*1</a></sup> '
                   + '<sup class="l-footnote">'
                        + '<a id="l-noteref.2" href="#l-footnote.2" '
                            + 'title="脚注2">*2</a></sup></p>\n\n'
                   + '<div class="l-footnote">\n<ol>\n'
                        + '<li><a id="l-footnote.1" href="#l-noteref.1">'
                            + '^</a> 脚注1</li>\n'
                        + '<li><a id="l-footnote.2" href="#l-noteref.2">'
                            + '^</a> 脚注2</li>\n'
                   + '</ol>\n</div>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('文字飾りを使うことができる', ()=>{
            r.text = '((**脚注**))\n';
            result = '<p><sup class="l-footnote">'
                        + '<a id="l-noteref.1" href="#l-footnote.1" '
                            + 'title="脚注">*1</a></sup></p>\n\n'
                   + '<div class="l-footnote">\n<ol>\n'
                        + '<li><a id="l-footnote.1" href="#l-noteref.1">'
                            + '^</a> <strong>脚注</strong></li>\n'
                   + '</ol>\n</div>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });

    suite('コメント', ()=>{
        test('// ではじまる行はコメントになる', ()=>{
            r.text = '// コメント\n';
            result = '';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('//- の場合は、HTMLのコメントになる', ()=>{
            r.text = '//- コメント\n';
            result = '<!-- コメント -->\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('/* と */ で囲まれた部分もコメントになる', ()=>{
            r.text = '/* コメント\nコメントの続き\n*/\n';
            result = '';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('/** と */ の場合は、HTMLのコメントになる', ()=>{
            r.text = '/** コメント\nコメントの続き\n*/\n';
            result = '<!-- コメント\nコメントの続き\n-->\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('コメントは段落を終了させる', ()=>{
            r.text = '段落\n// コメント\n';
            result = '<p>段落</p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('コメントは箇条書きを終了させる', ()=>{
            r.text = '- リスト\n// コメント\n';
            result = '<ul>\n<li>リスト</li>\n</ul>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('コメントは用語説明を終了させる', ()=>{
            r.text = ':用語\n//- コメント\n:用語\n説明\n// コメント';
            result = '<dl>\n<dt>用語</dt>\n</dl>\n\n'
                   + '<!-- コメント -->\n'
                   + '<dl>\n<dt>用語</dt>\n<dd>説明</dd>\n</dl>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });

    suite('モジュール', ()=>{
        test('#_(tag)', ()=>{
            r.text = '#_(tag)\n';
            result = '<tag>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('#_(tag param)', ()=>{
            r.text = '#_(tag param)\n';
            result = '<tag param>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('#_(tag param="param")', ()=>{
            r.text = '#_(tag param="param")\n';
            result = '<tag param="param">\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('#_(tag param="param" param)', ()=>{
            r.text = '#_(tag param="param" param)\n';
            result = '<tag param="param" param>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('#_(tag param="param" param)<<EOD', ()=>{
            r.text = '#_(tag param="param" param)<<EOD\n段落\nEOD\n';
            result = '<tag param="param" param>\n<p>段落</p>\n</tag>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('#_(style)<<EOD', ()=>{
            r.text = '#_(style)<<EOD\n  p { color: red; }\nEOD\n';
            result = '<style>\n  p { color: red; }\n</style>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('#_(tag param=1)', ()=>{
            r.text = '#_(tag param=1)\n';
            result = '<div style="color:red">'
                   + '#_(tag param=1)</div>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('モジュールを import できること', ()=>{
            r.text = '#import(paiga)\n&paiga{m1};';
            result = '<p><span class="l-mod-paiga" style="white-space:pre;">'
                   + '<img src="//kobalab.github.io/paiga/man1.gif"'
                   + ' width="24" height="34" alt="m1">'
                   + '</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('モジュールの import に失敗したときはエラー表示すること', ()=>{
            console.log = ()=>{};
            r.text = '#import(param)\n';
            result = '<div style="color:red">'
                   + '#import(param)</div>\n\n';
            return liulian(r).then(html=>{
                assert.equal(html, result);
                console.log = CONSOLE_LOG;
            });
        });
        test('#module(param)', ()=>{
            r.text = '#module(param)\n';
            result = '<div style="color:red">'
                   + '#module(param)</div>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('モジュールは段落を終了させる', ()=>{
            r.text = '段落\n#_(tag param)\n';
            result = '<p>段落</p>\n\n<tag param>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('モジュールは箇条書きを終了させる', ()=>{
            r.text = '- リスト\n#_(tag param)\n';
            result = '<ul>\n<li>リスト</li>\n</ul>\n\n<tag param>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('モジュールは用語説明を終了させる', ()=>{
            r.text = ':用語\n#_(tag param)\n'
                   + ':用語\n説明\n#_(tag param)\n';
            result = '<dl>\n<dt>用語</dt>\n</dl>\n\n<tag param>\n\n'
                   + '<dl>\n<dt>用語</dt>\n<dd>説明</dd>\n</dl>\n\n'
                   + '<tag param>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });
});
