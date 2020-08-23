const assert = require('assert');

function do_test(func, test_case) {
    for (let t of test_case) {
        let rv = func(t[0]);
        test(`${t[0]} → ${t[1]}`, ()=>assert.equal(rv, t[1]));
    }
}

suite('util.html-escape', ()=>{

    const escape = require('../lib/util/html-escape');
    test('モジュールが存在すること', ()=>assert.ok(escape));

    suite('cdata()', ()=>{
        const { cdata } = require('../lib/util/html-escape');
        const test_case = [
            [ '&<">',       '&amp;&lt;&quot;&gt;'                       ],
            [ '&<">_&<">',  '&amp;&lt;&quot;&gt;_&amp;&lt;&quot;&gt;'   ],
            [ '&copy;',     '&amp;copy;'                                ]
        ];
        do_test(cdata, test_case);
        test('パラメータなし', ()=>assert.equal(cdata(), ''));
    });
    suite('cref', ()=>{
        const { cref } = require('../lib/util/html-escape');
        const test_case = [
            [ '&copy;',         '&copy;'                            ],
            [ '&#4321;',        '&#4321;'                           ],
            [ '&#x90aF;',       '&#x90aF;'                          ],
            [ '&copy',          '&amp;copy'                         ],
            [ '&copy;&&#4321;', '&copy;&amp;&#4321;'                ]
        ];
        do_test(cref, test_case);
        test('パラメータなし', ()=>assert.equal(cref(), ''));
    });
    suite('strip', ()=>{
        const { strip } = require('../lib/util/html-escape');
        const test_case = [
            [ '<title>&amp;</title>',       '&'                     ],
            [ '&lt; &amp; &gt;',            '< & >'                 ],
            [ '&quot; &amp; &quot;',        '" & "'                 ]
        ];
        do_test(strip, test_case);
        test('パラメータなし', ()=>assert.equal(strip(), ''));
    });
});
