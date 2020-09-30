const assert = require('assert');

const fs = require('fs');
const { join } = require('path');

const HOME = join(__dirname, '/data/');

const resource = require('../lib/resource');
const req = {
    config:  { home: HOME },
    path:    '/',
    pathDir: '/',
    files()  { return this._files },
    msg(key) { return key },
    fixpath(path) { return path },
};
const res = {
    sendFile(path) { this._path = path },
    sendText(text) { this._text = text },
};

suite('resource/file', ()=>{

    let r;
    let time;
    let mode;

    suiteSetup(()=>{
        fs.mkdirSync(join(HOME, '/tmp'));
        time = Date.now();
        fs.writeFileSync(join(HOME, '/docs/file.png'),  'x'.repeat(100));
        fs.writeFileSync(join(HOME, '/docs/file.___'),  'x'.repeat(100));
        fs.writeFileSync(join(HOME, '/tmp/update.png'), 'x'.repeat(200));
    });

    suite('constructor()', ()=>{
        test('constructor()', ()=>{
            return resource(req, 'file.png').then(x=>r = x) });
        test('.path', ()=>
            assert.equal(r.path, join(HOME, '/docs/file.png')));
        test('.name', ()=>
            assert.equal(r.name, 'file.png'));
        test('.size', ()=>
            assert.equal(r.size, 100));
        test('.time', ()=>
            assert.ok(r.time - time < 10));
        test('.type', ()=>
            assert.equal(r.type, 'image/png'));
        test('.location', ()=>
            assert.equal(r.location, '/file.png'));
        test('.type == \'application/octet-stream\'', ()=>{
            return resource(req, 'file.___').then(r=>{
                assert.equal(r.type, 'application/octet-stream');
                assert.equal(r.type, 'application/octet-stream');
            });
        });
    });

    suite('.open()', ()=>{
        test('成功', ()=>{
            return r.open().then() });
        test('アクセス権なし', function(){
            fs.chmodSync(join(HOME, '/docs/file.png'), 0);
            if (fs.statSync(join(HOME, '/docs/file.png')).mode & 0o777)
                                                                this.skip();
            return r.open()
                    .then(assert.fail)
                    .catch(code=>assert.equal(code, 403));
        });
        test('ログインなし', ()=>{
            fs.chmodSync(join(HOME, '/docs/file.png'), 0o666);
            req.cmd = 'edit';
            return r.open()
                    .then(assert.fail)
                    .catch(code=>assert.equal(code, 403));
        });
    });

    suite('.send()', ()=>{
        test('成功', ()=>{
            delete req.cmd;
            r.send(res);
            assert.equal(res._path, join(HOME, '/docs/file.png'))
        });
        test('cmd=edit', ()=>{
            req.cmd = 'edit';
            r.send(res);
            assert.ok(res._text.match(/<form id="l-udfile"/));
        });
    });

    suite('.update()', ()=>{
        test('成功', ()=>{
            req.user = 'user';
            req._files = [ { path: join(HOME, '/tmp/update.png') } ];
            return r.update().then(()=>{
                assert.equal(
                    fs.readFileSync(join(HOME, '/docs/file.png')).length, 200);
                assert.deepEqual(r.redirect, [ 303, './?cmd=edit' ]);
            });
        });
        test('アクセス権なし', ()=>{
            fs.chmodSync(join(HOME, '/docs/file.png'), 0);
            return r.update()
                    .then(assert.fail)
                    .catch(code=>assert.equal(code, 403));
        });
        test('ログインなし', ()=>{
            fs.chmodSync(join(HOME, '/docs/file.png'), 0o666);
            delete req.user;
            return r.update()
                    .then(assert.fail)
                    .catch(code=>assert.equal(code, 403));
        });
        test('削除', ()=>{
            req.user = 'user';
            req._files = [];
            return r.update().then(()=>{
                try {
                    fs.statSync(join(HOME, '/docs/file.png'));
                    assert.fail();
                }
                catch(err) {
                    assert.equal(err.code, 'ENOENT');
                    assert.deepEqual(r.redirect, [ 303, './?cmd=edit' ]);
                }
            });
        });
    });

    suiteTeardown(()=>{
        fs.unlinkSync(join(HOME, '/docs/file.___'));
        fs.rmdirSync(join(HOME, '/tmp'));
    });
});
