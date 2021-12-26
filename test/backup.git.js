const assert = require('assert');
const fs     = require('fs');
const path   = require('path');

const GitDir = path.join(__dirname, 'GitDir')
const location = '/dir/test.txt';

suite('backup/git', ()=>{

    suiteSetup(()=>{
        fs.mkdirSync(GitDir);
        fs.mkdirSync(path.join(GitDir, '.git'));
        fs.mkdirSync(path.join(GitDir, 'dir'));
    });

    test('モジュールが存在すること', ()=>assert.ok(require('../lib/backup/git')));

    test('インスタンスが生成できること', async ()=>{
        let git = require('../lib/backup/git')(GitDir);
        assert.ok(git);

        let log = await git.log(location);
        assert.equal(log.length, 0);
    });

    test('checkIn()', async ()=>{
        const git = require('../lib/backup/git')(GitDir);

        fs.writeFileSync(path.join(GitDir, location), 'revision 1\n');
        let time = fs.statSync(path.join(GitDir, location)).mtimeMs;

        await git.checkIn(location, time, 'user');

        let log = await git.log(location);

        assert.equal(log[0].time, time);

        await git.checkIn(location, time, 'user');
    });

    test('log()', async ()=>{
        const git = require('../lib/backup/git')(GitDir);

        fs.writeFileSync(path.join(GitDir, location), 'revision 2\n');
        let time = fs.statSync(path.join(GitDir, location)).mtimeMs;
        await git.checkIn(location, time, 'user');

        fs.writeFileSync(path.join(GitDir, location), 'revision 3\n');

        let log = await git.log(location);

        assert.equal(log.length, 2);
    });

    test('diff()', async ()=>{
        const git = require('../lib/backup/git')(GitDir);
        let log = await git.log(location);
        assert.deepEqual(await git.diff(location, log[1].rev, log[0].rev),
                        [ '@@ -1 +1 @@', '-revision 1', '+revision 2', '' ]);
        assert.deepEqual(await git.diff(location, log[1].rev),
                        [ '@@ -1 +1 @@', '-revision 1', '+revision 3', '' ]);
    });

    test('checkOut()', async ()=>{
        const git = require('../lib/backup/git')(GitDir);
        let log = await git.log(location);
        assert.equal(await git.checkOut(location, log[1].rev),
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
