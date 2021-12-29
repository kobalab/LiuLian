const assert = require('assert');

const { timeStr, sizeStr } = require('../lib/util/str-tool');

suite('util/str-tool', ()=>{

    test('モジュールが存在すること', ()=>
            assert.ok(require('../lib/util/str-tool')));

    suite('timeStr()', ()=>{
        const now = new Date();
        test('今', ()=>{
            let hhmm = now.toTimeString().substr(0,5);
            assert.equal(timeStr(now.getTime()), hhmm);
        });
        test('本日0時0分', ()=>{
            let y = now.getFullYear();
            let m = now.getMonth() + 1;
            let d = now.getDate();
            assert.equal(timeStr(new Date(y, m-1, d).getTime()).substr(-5),
                         '00:00');
        });
        test('先月1日', ()=>{
            let y = now.getFullYear();
            let m = now.getMonth() + 1;
            y = m == 1 ? y - 1 : y;
            m = m == 1 ? 12 : m - 1;
            assert.equal(timeStr(new Date(y, m-1, 1).getTime()),
                         `${m}/1 00:00`);
        });
        test('直近の9月1日', ()=>{
            let y = now.getFullYear();
            let m = now.getMonth() + 1;
            y = m < 9 ? y - 1 : y;
            const re = new RegExp(`^(?:${y}/09/01|9/1 00:00)$`);
            assert.ok(timeStr(new Date(y, 9-1, 1).getTime()).match(re));
        });
        test('一年前', ()=>{
            assert.ok(timeStr(now - 1000*60*60*24*365)
                        .match(/^\d{4}\/\d{2}\/\d{2}$/));
        });
    });

    suite('sizeStr()', ()=>{
        test('サイズなし', ()=>
            assert.equal(sizeStr(), '-'));
        test('単位なし', ()=>
            assert.equal(sizeStr(500), '500'));
        test('KB', ()=>
            assert.equal(sizeStr(5000), '4.9 KB'));
        test('MB', ()=>
            assert.equal(sizeStr(5000*1000), '4.8 MB'));
        test('GB', ()=>
            assert.equal(sizeStr(5000*1000*1000), '4.7 GB'));
        test('TB', ()=>
            assert.equal(sizeStr(5000*1000*1000*1000), '4.5 TB'));
        test('巨大', ()=>
            assert.equal(sizeStr(5000*1000*1000*1000*1000), '4547.5 TB'));
    });
});
