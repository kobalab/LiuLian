const assert = require('assert');
const fs     = require('fs');
const path   = require('path');

const GitDir = path.join(__dirname, 'GitDir')

suite('backup/git', ()=>{

    suiteSetup(()=>{
        fs.mkdirSync(GitDir);
        fs.mkdirSync(path.join(GitDir, '.git'));
    });

    test('モジュールが存在すること', ()=>assert.ok(require('../lib/backup/git')));

    test('インスタンスが生成できること', async ()=>{
        let git = require('../lib/backup/git')(GitDir);
        assert.ok(git);

        await git.log('test.txt');
    });

    test('checkIn()', async ()=>{
        const git = require('../lib/backup/git')(GitDir);

        fs.writeFileSync(path.join(GitDir, 'test.txt'), 'revision 1\n');
        let time1 = Math.floor(Date.now() / 1000) * 1000;

        await git.checkIn('test.txt', 'user');

        let time2 = Math.floor(Date.now() / 1000) * 1000;
        let log = await git.log('test.txt');

        assert.ok(time1 <= log[0].time && log[0].time <= time2);
    });

    test('log()', async ()=>{
        const git = require('../lib/backup/git')(GitDir);

        fs.writeFileSync(path.join(GitDir, 'test.txt'), 'revision 2\n');
        let time1 = Math.floor(Date.now() / 1000) * 1000;
        await git.checkIn('test.txt', 'user');
        let time2 = Math.floor(Date.now() / 1000) * 1000;
        fs.writeFileSync(path.join(GitDir, 'test.txt'), 'revision 3\n');

        let log = await git.log('test.txt');

        assert.equal(log.length, 2);
        assert.ok(time1 <= log[0].time && log[0].time <= time2);
    });

    test('diff()', async ()=>{
        const git = require('../lib/backup/git')(GitDir);
        let log = await git.log('test.txt');
        assert.deepEqual(await git.diff('test.txt', log[1].rev, log[0].rev),
                        [ '@@ -1 +1 @@', '-revision 1', '+revision 2', '' ]);
        assert.deepEqual(await git.diff('test.txt', log[1].rev),
                        [ '@@ -1 +1 @@', '-revision 1', '+revision 3', '' ]);
    });

    test('checkOut()', async ()=>{
        const git = require('../lib/backup/git')(GitDir);
        let log = await git.log('test.txt');
        assert.equal(await git.checkOut('test.txt', log[1].rev),
                                        'revision 1\n');
    });

    test('gitで初期化されていない場合、インスタンスを生成しないこと', ()=>{
        fs.rmSync(path.join(GitDir, '.git'), {recursive: true});
        assert.ok(! require('../lib/backup/git')(GitDir));
    });

    suiteTeardown(()=>{
        fs.rmSync(GitDir, {recursive: true});
    });
});
