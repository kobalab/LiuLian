const assert = require('assert');

const fs = require('fs');
const { join } = require('path');

const File    = require('../lib/resource/file');
const Folder  = require('../lib/resource/folder');
const Text    = require('../lib/resource/text');
const LiuLian = require('../lib/resource/liulian');

const HOME = join(__dirname, '/data/');
const files = ['file','file.txt','file.png','noperm'];

const resource = require('../lib/resource');
const req = {
    config: { home: HOME },
    path: '/',
    pathDir: '/',
};

suite('resource', ()=>{

    suiteSetup(()=>{
        for (let file of files) {
            fs.writeFileSync(join(HOME, '/docs/', file));
        }
        fs.chmodSync(join(HOME, '/docs/', 'noperm'), 0);
    });

    test('モジュールが存在すること', ()=>assert.ok(resource));

    test('ファイル', ()=>{
        return resource(req, 'file.png').then(r=>{
            assert.ok(r instanceof File);
            assert.equal(r.location, '/file.png');
        });
    });
    test('Textファイル', ()=>{
        return resource(req, 'file.txt').then(r=>assert.ok(r instanceof Text));
    });
    test('LiuLianファイル', ()=>{
        return resource(req, 'file').then(r=>assert.ok(r instanceof LiuLian));
    });
    test('フォルダ', ()=>{
        return resource(req).then(r=>{
            assert.ok(r instanceof Folder);
            assert.equal(r.location, '/');
        });
    });
    test('特殊ファイル');
    test('ファイルなし', ()=>{
        return resource(req, 'file.html').then(assert.fail)
                                         .catch(code=>assert.equal(code, 404));
    });
    test('アクセス権なし');
    test('相対パス', ()=>{
        return resource(req, './file').then(r=>{
            assert.ok(r instanceof LiuLian);
            assert.equal(r.location, '/file')
        });
    });
    test('絶対パス', ()=>{
        return resource(req, '/file').then(r=>{
            assert.ok(r instanceof LiuLian);
            assert.equal(r.location, '/file')
        });
    });
    test('外部ファイル', ()=>{
        return resource(req, '//other').then(assert.fail)
                                       .catch(code=>assert.equal(code, 404));
    });

    suiteTeardown(()=>{
        for (let file of files) {
            fs.unlinkSync(join(HOME, '/docs/', file));
        }
    });
});
