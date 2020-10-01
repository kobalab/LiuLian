const assert  = require('assert');

const parser = {

    _note: [],
    _r: { _req: { baseUrl: '/base' } },

    inlineModule(str, name, param, value) {
        if (param || value) return `&${name}(${param}){${value}};`;
        else return `&${name};`;
    },
    noteref(str) {
        this._note.push(str);
        return '.' + this._note.length;
    }
}

function do_test(inline, test_case, parser) {
    for (let t of test_case) {
        let rv = inline(t[0]);
        test(`${t[0]} → ${t[1]}`, ()=>assert.equal(rv, t[1]));
        if (! t[2]) continue;
        let fn = parser._note[parser._note.length - 1];
        test(`${t[0]} → ${fn}`, ()=>assert.equal(fn, t[2]));
    }
}

suite('text/inline', ()=>{

suite('inline()', ()=>{

  const inline = require('../lib/text/inline')();
  test('require', ()=>assert.ok(inline));
  test('undefined → \'\'', ()=>assert.equal(inline(), ''));

  suite('markup', ()=>{
    suite('module', ()=>{
      const test_case = [
        [ '&_(tag param="1"){value};','<tag param="1">value</tag>'          ],
        [ '&_(tag param="1"){};',     '<tag param="1"></tag>'               ],
        [ '&_(tag param="1");',       '<tag param="1">'                     ],
        [ '&_(tag);',                 '<tag>'                               ],
        [ '&_(tag param="1" param);', '<tag param="1" param>'               ],
        [ '&_(tag param=">");',       '&amp;_(tag param=&quot;&gt;&quot;);' ],
        [ '&tag;',                    '&tag;'                               ],
        [ '&tag();',                  '&amp;tag();'                         ],
        [ '&_(tag){}};',              '<tag>}</tag>'                        ],
        [ '&_(tag1){&_(tag2){}};};' , '<tag1><tag2>}</tag2></tag1>'         ],
      ];
      do_test(inline, test_case);
    });
    suite('strong', ()=>{
      const test_case = [
        [ '**&strong**',              '<strong>&amp;strong</strong>'        ],
        [ '**\'\'strong\'\'**',       '<strong><em>strong</em></strong>'    ],
      ];
      do_test(inline, test_case);
    });
    suite('em', ()=>{
      const test_case = [
        [ '\'\'&em\'\'',              '<em>&amp;em</em>'                    ],
        [ '\'\'%%em%%\'\'',           '<em><del>em</del></em>'              ],
      ];
      do_test(inline, test_case);
    });
    suite('del', ()=>{
      const test_case = [
        [ '%%&del%%',                 '<del>&amp;del</del>'                 ],
        [ '%%``em``%%',               '<del><code>em</code></del>'          ],
      ];
      do_test(inline, test_case);
    });
    suite('code', ()=>{
      const test_case = [
        [ '``&code``',                '<code>&amp;code</code>'              ],
        [ '``**code**``',             '<code><strong>code</strong></code>'  ],
      ];
    });
    suite('kbd', ()=>{
      const test_case = [
        [ '```&kbd```',               '<kbd>&amp;kbd</kbd>'                 ],
        [ '```**kbd**```',            '<kbd><strong>kbd</strong></kbd>'     ],
      ];
      do_test(inline, test_case);
    });
    suite('as-is', ()=>{
      const test_case = [
        [ '{{&as-is}}',               '&amp;as-is'                          ],
        [ '{{%%as-is%%}}',            '%%as-is%%'                           ],
        [ '{{&#1234;}}',              '&amp;#1234;'                         ],
      ];
      do_test(inline, test_case);
    });
    suite('bracket', ()=>{
      const test_case = [
        [ '[[&bracket]]',       '<a href="&amp;bracket">&amp;bracket</a>'   ],
        [ '[[A & B]]',          '<a href="A%20&amp;%20B">A &amp; B</a>'     ],
        [ '[[[bracket]]]',      '[<a href="bracket">bracket</a>]'           ],
        [ '[[bracket|./]]',      '<a href="./">bracket</a>'                 ],
        [ '[[|bracket||./]]',    '<a href="./">|bracket|</a>'               ],
        [ '[[``bracket``]]', '<a href="%60%60bracket%60%60">``bracket``</a>'],
        [ '[[``bracket``|./]]',  '<a href="./"><code>bracket</code></a>'    ],
        [ '[[Home|/]]',          '<a href="/">Home</a>'                     ],
        [ '[[テスト]]',    '<a href="%E3%83%86%E3%82%B9%E3%83%88">テスト</a>' ],
        [ '[[100%|100%]]',       '<a href="100%25">100%</a>'                ],
      ];
      do_test(inline, test_case);
    });
    suite('footnote', ()=>{
      const test_case = [
        [ '((&footnote))',            '(&amp;footnote)'                     ],
        [ '(([[note]]))',             '(<a href="note">note</a>)'           ],
      ];
      do_test(inline, test_case);
    });
  });

  suite('text', ()=>{
    suite('link', ()=>{
      const test_case = [
        [ 'http://kobalab.net/',
          '<a href="http://kobalab.net/">http://kobalab.net/</a>'           ],
        [ 'mailto:koba@kobalab.net',
          '<a href="mailto:koba@kobalab.net">mailto:koba@kobalab.net</a>'   ],
        [ 'koba@kobalab.net',
          '<a href="mailto:koba@kobalab.net">koba@kobalab.net</a>'          ],
        [ 'http://kobalab.net/?a=1&b=2',
          '<a href="http://kobalab.net/?a=1&amp;b=2">'
            + 'http://kobalab.net/?a=1&amp;b=2</a>'                         ],
        [ '<koba@kobalab.net>',
          '&lt;<a href="mailto:koba@kobalab.net">koba@kobalab.net</a>&gt;'  ],
      ];
      do_test(inline, test_case);
    });
  });
});

suite('inline(parser)', ()=>{

  const inline = require('../lib/text/inline')(parser);
  test('require', ()=>assert.ok(inline));

  suite('module', ()=>{
    const test_case = [
      [ '&name(param){value};',     '&name(param){value};'                  ],
      [ '&name;',                   '&name;'                                ],
    ];
    do_test(inline, test_case, parser);
  });
  suite('noteref', ()=>{
    const test_case = [
      [ '((&noteref))',
        '<sup class="l-footnote"><a id="l-noteref.1" href="#l-footnote.1" '
          + 'title="&amp;noteref">*1</a></sup>',
        '&amp;noteref'                                                      ],
      [ '(([[&note]]))',
        '<sup class="l-footnote"><a id="l-noteref.2" href="#l-footnote.2" '
          + 'title="&amp;note">*2</a></sup>',
        '<a href="&amp;note">&amp;note</a>'                                 ],
    ];
    do_test(inline, test_case, parser);
  });
  suite('bracket', ()=>{
      const test_case = [
        [ '[[Home|/]]',          '<a href="/base/">Home</a>'                ],
      ];
      do_test(inline, test_case);
  });
});

});
