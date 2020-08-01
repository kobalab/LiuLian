const assert  = require('assert');
const inline = require('../lib/text/inline');

const test_case = [
    [ undefined,                    ''                                  ],
  // cdata
    [ 'Hello',                      'Hello'                             ],
    [ '&',                          '&amp;'                             ],
    [ '"',                          '&quot;'                            ],
    [ '<',                          '&lt;'                              ],
    [ '>',                          '&gt;'                              ],
    [ '&&',                         '&amp;&amp;'                        ],
    [ '""',                         '&quot;&quot;'                      ],
    [ '<<',                         '&lt;&lt;'                          ],
    [ '>>',                         '&gt;&gt;'                          ],
    [ '_<"&">_',                    '_&lt;&quot;&amp;&quot;&gt;_'       ],
  // cref
    [ '&#9834;',                    '&#9834;'                           ],
    [ '&#x266A;',                   '&#x266A;'                          ],
    [ '_&#9835;&#x266f;_',          '_&#9835;&#x266f;_'                 ],
    [ '_&#983A;_',                  '_&amp;#983A;_'                     ],
  // strong
    [ '**Hello**',                  '<strong>Hello</strong>'            ],
    [ '**<"&">**',          '<strong>&lt;&quot;&amp;&quot;&gt;</strong>'],
    [ '***next***',                 '<strong>*next</strong>*'           ],
  // em
    [ '\'\'Hello\'\'',              '<em>Hello</em>'                    ],
    [ '\'\'<"&">\'\'',              '<em>&lt;&quot;&amp;&quot;&gt;</em>'],
    [ '\'\'\'next\'\'\'',           '<em>\'next</em>\''                 ],
  // del
    [ '%%Hello%%',                  '<del>Hello</del>'                  ],
    [ '%%<"&">%%',                  '<del>&lt;&quot;&amp;&quot;&gt;</del>'  ],
    [ '%%%next%%%',                 '<del>%next</del>%'                 ],
  // code
    [ '``Hello``',                  '<code>Hello</code>'                ],
    [ '``<"&">``',                  '<code>&lt;&quot;&amp;&quot;&gt;</code>'],
  // kbd
    [ '```Hello```',                '<kbd>Hello</kbd>'                  ],
    [ '```<"&">```',                '<kbd>&lt;&quot;&amp;&quot;&gt;</kbd>'  ],
  // as-is
    [ '{{Hello}}',                  'Hello'                             ],
    [ '{{<"&">}}',                  '&lt;&quot;&amp;&quot;&gt;'         ],
    [ '{{{next}}}',                 '{next}'                            ],
    [ '{{&#9834;}}',                '&amp;#9834;'                       ],
  // bracket
    [ '[[Hello]]',                  '<a href="Hello">Hello</a>'         ],
    [ '[[B & W]]',                  '<a href="B%20&amp;%20W">B &amp; W</a>' ],
    [ '[[[next]]]',                 '[<a href="next">next</a>]'         ],
    [ '[[|Home||./]]',              '<a href="./">|Home|</a>'           ],
    [ '[[``a``|./]]',               '<a href="./"><code>a</code></a>'   ],
    [ '[[``a``]]',                  '<a href="%60%60a%60%60">``a``</a>' ],
  // footnote
    [ '((Hello))',
      '<sup class="ll-footnote">'
        + '<a id="NOTEREF.1" href="#FOOTNOTE.1" title="Hello">*1</a></sup>' ],
  // link
    [ 'http://kobalab.net/',
      '<a href="http://kobalab.net/">http://kobalab.net/</a>'           ],
    [ 'mailto:koba@kobalab.net',
      '<a href="mailto:koba@kobalab.net">mailto:koba@kobalab.net</a>'   ],
    [ 'koba@kobalab.net',
      '<a href="mailto:koba@kobalab.net">koba@kobalab.net</a>'          ],
    [ 'http://kobalab.net/?a=1&b=2',
      '<a href="http://kobalab.net/?a=1&amp;b=2">'+
      'http://kobalab.net/?a=1&amp;b=2</a>'           ],
    [ '<koba@kobalab.net>',
      '&lt;<a href="mailto:koba@kobalab.net">koba@kobalab.net</a>&gt;'  ],
  // module
    [ '&_(tag param="1"){value}',   '<tag param="1">value</tag>'        ],
    [ '&_(tag param="1"){}',        '<tag param="1"></tag>'             ],
    [ '&_(tag param="1");',         '<tag param="1">'                   ],
    [ '&_(tag);',                   '<tag>'                             ],
    [ '&_(tag param1 param2);',     '<tag param1 param2>'               ],
    [ '&_(tag param=">");',         '&amp;_(tag param=&quot;&gt;&quot;);'   ],
    [ '&_(div){<&_(span){&}>}',     '<div>&lt;<span>&amp;</span>&gt;</div>' ],
    [ '&copy;',                     '&copy;'                            ],
];

suite('inline', ()=>{
    for (let tc of test_case) {
        test(`${tc[0]||'undefined'} → ${tc[1]}`,
            ()=>assert.equal(inline(tc[0]), tc[1]));
    }
});
