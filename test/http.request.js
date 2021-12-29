const assert = require('assert');

const Request = require('../lib/http/request');

const _req = {
    method:      'GET',
    protocol:    'http',
    url:         '/path',
    originalUrl: '/base/path/file',
    baseUrl:     '/base',
    path:        '/path/file',
    ip:          '127.0.0.2',
    query:       { cmd: 'test' },
    sessionID:   'sessionID',
    user:        'user',
    headers: {
        host:           '127.0.0.1:3571',
        'user-agent':   'Mozilla/5.0',
    },
    acceptsLanguages: ()=>'ja',
    header:           ()=>'Mozilla/5.0'
};

suite('http/request', ()=>{

    test('モジュールが存在すること', ()=>assert.ok(Request));

    suite('--mount なし', ()=>{
        const liulian = { _version: '1.0.0',
                          _productUrl: 'http://hostname/',
                          _: { locale: (lang)=>lang == 'ja' } };
        const req = new Request(liulian, _req);
        test('インスタンスが生成できること', ()=>assert.ok(req));
        test('.version',   ()=>assert.equal(req.version,   '1.0.0'));
        test('.productUrl',()=>assert.equal(req.productUrl,'http://hostname/'));
        test('.config',    ()=>assert.strictEqual(req.config, liulian._));
        test('.method',    ()=>assert.equal(req.method,    'GET'));
        test('.scheme',    ()=>assert.equal(req.scheme,    'http'));
        test('.host',      ()=>assert.equal(req.host,      '127.0.0.1:3571'));
        test('.url',       ()=>assert.equal(req.url,       '/base/path/file'));
        test('.baseUrl',   ()=>assert.equal(req.baseUrl,   '/base'));
        test('.path',      ()=>assert.equal(req.path,      '/path/file'));
        test('.pathDir',   ()=>assert.equal(req.pathDir,   '/path/'));
        test('.remote',    ()=>assert.equal(req.remote,    '127.0.0.2'));
        test('.sessionID', ()=>assert.equal(req.sessionID, 'sessionID'));
        test('.user',      ()=>assert.equal(req.user,      'user'));
        test('.cmd',       ()=>assert.equal(req.cmd,       'test'));
        suite('.query', ()=>{
            test('パラメータなし', ()=>assert.equal(req.query, null));
            test('パラメータあり', ()=>{
                _req.url += '?x=1&y=2';
                assert.equal(req.query, 'x=1&y=2');
            });
            test('QUERYに ? があるケース', ()=>{
                _req.url += '&z=1?2';
                assert.equal(req.query, 'x=1&y=2&z=1?2');
            });
        });
        suite('.params()', ()=>{
            test('パラメータなし (GET)', ()=>{
                _req.query = {};
                assert.equal(req.params().length, 0);
            });
            test('パラメータあり (GET)', ()=>{
                _req.query = { x: 1, y: [ 2, 3 ] };
                assert.deepEqual(req.params(),    ['x', 'y']);
                assert.deepEqual(req.params('x'), [ 1 ]);
                assert.deepEqual(req.params('y'), [ 2, 3 ]);
                assert.deepEqual(req.params('z'), []);
            });
            test('パラメータなし (POST)', ()=>{
                _req.method = 'POST';
                _req.body = {};
                assert.equal(req.params().length, 0);
            });
            test('パラメータあり (POST)', ()=>{
                _req.body = { x: 1, y: [ 2, 3 ] };
                assert.deepEqual(req.params(),    ['x', 'y']);
                assert.deepEqual(req.params('x'), [ 1 ]);
                assert.deepEqual(req.params('y'), [ 2, 3 ]);
                assert.deepEqual(req.params('z'), []);
            });
        });
        suite('.param()', ()=>{
            test('パラメータあり (GET)', ()=>{
                _req.method = 'GET';
                _req.query = { x: 1, y: [ 2, 3 ] };
                assert.deepEqual(req.param(), ['x', 'y']);
                assert.equal(req.param('x'), 1);
                assert.equal(req.param('y'), 2);
                assert.equal(req.param('z'), null);
            });
            test('パラメータあり (POST)', ()=>{
                _req.method = 'POST';
                _req.body = { x: 1, y: [ 2, 3 ] };
                assert.deepEqual(req.param(), ['x', 'y']);
                assert.equal(req.param('x'), 1);
                assert.equal(req.param('y'), 2);
                assert.equal(req.param('z'), null);
            });
        });
        suite('.files()', ()=>{
            test('アップロードなし', ()=>{
                assert.deepEqual(req.files(), []);
                assert.deepEqual(req.files('file'), []);
            });
            test('ファイルなし', ()=>{
                _req.files = {};
                assert.deepEqual(req.files(), []);
                assert.deepEqual(req.files('file'), []);
            });
            test('ファイルあり', ()=>{
                _req.files = {
                    file: [{ originalname: 'index.html',
                             path:         '/tmp/0123456789' }]
                };
                assert.deepEqual(req.files(), ['file']);
                assert.deepEqual(req.files('file'), [
                                            { name: 'index.html',
                                              path: '/tmp/0123456789' }]);
                assert.deepEqual(req.files('file2'), []);
            });
        });
        suite('.header()', ()=>{
            test('一覧取得', ()=>assert.deepEqual(req.header(),
                                                ['host', 'user-agent']));
            test('項目取得', ()=>assert.equal(req.header('User-Agent'),
                                                        'Mozilla/5.0'));
        });
        suite('.fullUrl()', ()=>{
            test('外部URL: http://', ()=>
                assert.equal(req.fullUrl('http://kobalab.net/'),
                             'http://kobalab.net/'));
            test('外部URL: //', ()=>
                assert.equal(req.fullUrl('//kobalab.net/'),
                             'http://kobalab.net/'));
            test('絶対パス: /file', ()=>
                assert.equal(req.fullUrl('/file'),
                             'http://127.0.0.1:3571/base/file'));
            test('相対パス: file', ()=>
                assert.equal(req.fullUrl('file'),
                             'http://127.0.0.1:3571/base/path/file'));
            test('相対パス: ./file', ()=>
                assert.equal(req.fullUrl('./file'),
                             'http://127.0.0.1:3571/base/path/file'));
            test('相対パス: ../file', ()=>
                assert.equal(req.fullUrl('../file'),
                             'http://127.0.0.1:3571/base/file'));
        });
    });

    suite('--mount https://kobalab.net/liulian', ()=>{
        const liulian = { '_': { locale: ()=>{} } };
        liulian._mount = {
            scheme: 'https',
            host:   'kobalab.net',
            base:   '/liulian'
        };
        const req = new Request(liulian, _req);
        test('インスタンスが生成できること', ()=>assert.ok(req));
        test('.scheme',    ()=>assert.equal(req.scheme,    'https'));
        test('.host',      ()=>assert.equal(req.host,      'kobalab.net'));
        test('.url',       ()=>assert.equal(req.url,
                                                '/liulian/path?x=1&y=2&z=1?2'));
        test('.baseUrl',   ()=>assert.equal(req.baseUrl,   '/liulian'));
        suite('.fullUrl()', ()=>{
            test('外部URL: http://', ()=>
                assert.equal(req.fullUrl('http://kobalab.net/'),
                             'http://kobalab.net/'));
            test('外部URL: //', ()=>
                assert.equal(req.fullUrl('//kobalab.net/'),
                             'https://kobalab.net/'));
            test('絶対パス: /file', ()=>
                assert.equal(req.fullUrl('/file'),
                             'https://kobalab.net/liulian/file'));
            test('相対パス: file', ()=>
                assert.equal(req.fullUrl('file'),
                             'https://kobalab.net/liulian/path/file'));
            test('相対パス: ./file', ()=>
                assert.equal(req.fullUrl('./file'),
                             'https://kobalab.net/liulian/path/file'));
            test('相対パス: ../file', ()=>
                assert.equal(req.fullUrl('../file'),
                             'https://kobalab.net/liulian/file'));
        });
    });

    suite('openFile()', ()=>{
        test('ファイルオープン数オーバー', ()=>{
            const liulian = { _version: '1.0.0',
                              _productUrl: 'http://hostname/',
                              _: { locale: (lang)=>lang == 'ja' } };
            const req = new Request(liulian, _req);
            assert.throws(()=>{
                for (;;) req.openFile();
            });
        });
    });
});
