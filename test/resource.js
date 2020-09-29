const assert = require('assert');

const fs = require('fs');
const { join } = require('path');

const File    = require('../lib/resource/file');
const Folder  = require('../lib/resource/folder');
const Text    = require('../lib/resource/text');
const LiuLian = require('../lib/resource/liulian');

const HOME = join(__dirname, '/data/');
const files = ['file','file.txt','file.png'];

const resource = require('../lib/resource');
const req = {
    config: { home: HOME },
    path: '/',
    pathDir: '/',
};

suite('resource', ()=>{

    let skip_dev_test;

    suiteSetup(()=>{
        for (let file of files) {
            fs.writeFileSync(join(HOME, '/docs/', file));
        }
        try {
            if (! fs.statSync('/dev/null').isFile())
                fs.symlinkSync('/dev/null', join(HOME, '/docs/null'));
            else skip_dev_test = true;
        }
        catch(err) {
            skip_dev_test = true;
        }
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
    test('特殊ファイル', function(){
        if (skip_dev_test) this.skip();
        return resource(req, 'null').then(assert.fail)
                                    .catch(code=>assert.equal(code, 404));
    });
    test('ファイルなし', ()=>{
        return resource(req, 'file.html').then(assert.fail)
                                         .catch(code=>assert.equal(code, 404));
    });
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
        if (! skip_dev_test) fs.unlinkSync(join(HOME, '/docs/null'));
        for (let file of files) {
            fs.unlinkSync(join(HOME, '/docs/', file));
        }
    });
});
