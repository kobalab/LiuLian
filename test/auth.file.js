const assert = require('assert');
const fs     = require('fs');

const auth_file = __dirname + '/data/auth/local/passwd';

let auth;

suite('auth/file', ()=>{

    suiteSetup(()=>fs.writeFileSync(auth_file, ''));

    test('モジュールが存在すること', ()=>assert.ok(require('../lib/auth/file')));

    suite('constructor()', ()=>{
        test('インスタンスが生成できること', ()=>{
            auth = require('../lib/auth/file')(auth_file);
            assert.ok(auth);
        });
        test('初期状態でユーザがいないこと', ()=>
            assert.ok(! auth.users().length));
        test('初期状態で管理者がいないこと', ()=>
            assert.ok(! auth.admin()));
    });

    suite('.add()', ()=>{
        test('追加後にユーザ数が増えていること', ()=>{
            auth.add('admin', 'passwd');
            assert.deepEqual(auth.users(), ['admin']);
        });
        test('追加したユーザが存在すること', ()=>
            assert.ok(auth.exist('admin')));
        test('最初に追加したユーザが管理者になること', ()=>
            assert.equal(auth.admin(), 'admin'));
        test('ユーザ認証できること', ()=>
            assert.ok(auth.validate('admin', 'passwd')));
        test('2人目のユーザが正しく登録されること', ()=>{
            auth.add('user', 'passwd');
            assert.deepEqual(auth.users(), ['admin', 'user']);
            assert.ok(auth.exist('user'));
            assert.equal(auth.admin(), 'admin');
            assert.ok(auth.validate('user', 'passwd'));
        });
        test('パスワードなしでもユーザが登録できること', ()=>{
            auth.add('user2');
            assert.deepEqual(auth.users(), ['admin', 'user', '#user2']);
            assert.ok(auth.exist('user2'));
        });
        test('すでに存在するユーザ名で登録できないこと', ()=>{
            auth.add('user');
            assert.equal(auth.users().length, 3);
            assert.ok(auth.validate('user', 'passwd'));
        });
        test(': を含むユーザ名を登録できないこと', ()=>{
            auth.add('user:');
            assert.equal(auth.users().length, 3);
            assert.ok(! auth.exist('user:'));
        });
        test('再読み込みで正しく情報が反映されること', (done)=>{
            setTimeout(()=>{
                auth = require('../lib/auth/file')(auth_file);
                assert.deepEqual(auth.users(), ['admin', 'user', '#user2']);
                assert.equal(auth.admin(), 'admin');
                assert.ok(auth.validate('admin', 'passwd'));
                assert.ok(auth.validate('user', 'passwd'));
                done();
            }, 10);
        });
    });

    suite('.passwd()', ()=>{
        test('パスワードが変更できること', ()=>{
            auth.passwd('user', 'new-passwd');
            assert.ok(auth.validate('user', 'new-passwd'));
        });
        test('停止中ユーザを復旧できること', ()=>{
            auth.passwd('user2', 'passwd');
            assert.ok(auth.validate('user2', 'passwd'));
        });
        test('存在しないユーザを復旧できないこと', ()=>{
            auth.passwd('*', 'passwd');
            assert.equal(auth.users().length, 3);
            assert.ok(! auth.validate('*', 'passwd'));
        });
        test('再読み込みで正しく情報が反映されること', (done)=>{
            setTimeout(()=>{
                auth = require('../lib/auth/file')(auth_file);
                assert.deepEqual(auth.users(), ['admin', 'user', 'user2']);
                done();
            }, 10);
        });
    });

    suite('.del()', ()=>{
        test('ユーザを停止できること', ()=>{
            auth.del('user');
            assert.ok(! auth.validate('user', 'new-passwd'));
            assert.ok(auth.exist('user'));
            assert.deepEqual(auth.users(), ['admin', '#user', 'user2']);
        });
        test('管理者でも停止できること', ()=>{
            auth.del('admin');
            assert.ok(auth.admin(), 'admin');
            assert.deepEqual(auth.users(), ['#admin', '#user', 'user2']);
        });
        test('ユーザを削除できること', ()=>{
            auth.del('user2', true);
            assert.ok(! auth.exist('user2'));
            assert.deepEqual(auth.users(), ['#admin', '#user']);
        });
        test('再読み込みで正しく情報が反映されること', (done)=>{
            setTimeout(()=>{
                auth = require('../lib/auth/file')(auth_file);
                assert.deepEqual(auth.users(), ['#admin', '#user']);
                done();
            }, 10);
        });
    });

    suite('.admin()', ()=>{
        test('管理者が変更できること', ()=>{
            auth.admin('user');
            assert.equal(auth.admin(), 'user');
        });
        test('管理者を誤ったユーザに変更できないこと', ()=>{
            auth.admin('*');
            assert.equal(auth.admin(), 'user');
        });
        test('再読み込みで正しく情報が反映されること', (done)=>{
            setTimeout(()=>{
                auth = require('../lib/auth/file')(auth_file);
                assert.equal(auth.admin(), 'user');
                done();
            }, 10);
        });
    });

    suiteTeardown(()=>fs.writeFileSync(auth_file, ''));
});
