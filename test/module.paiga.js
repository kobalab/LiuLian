const assert = require('assert');

const liulian = require('../lib/text/liulian');
const r = {
    _req: {
        config: { home: __dirname + '/data/' },
        pathDir: '/path/',
        baseUrl: '/base',
        param() {},
        openFile() {},
    },
    openFile: require('../lib/resource'),
    _: {},
    title(title) { this._.title = title },
    stylesheet(...arg) { this._.stylesheet = arg },
    style(text) { this._.style = text },
    icon(url) { this._.icon = url },
    lang(lang) { this._.lang = lang },
    meta(attr) { this._.meta = attr },
    script(script) { this._.script = script }
};
let result;

suite('module/paiga', ()=>{

    suite('paiga - 牌画像を出力する', ()=>{
        test('単一の牌画像', ()=>{
            r.text = '#import(paiga)\n\n&paiga{m1};\n';
            result = '<p><span class="l-mod-paiga" style="white-space:pre;">'
                   + '<img src="//kobalab.github.io/paiga/2/m1.png"'
                   + ' width="24" height="32" alt="m1">'
                   + '</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('伏せ牌', ()=>{
            r.text = '#import(paiga)\n\n&paiga{_};\n';
            result = '<p><span class="l-mod-paiga" style="white-space:pre;">'
                   + '<img src="//kobalab.github.io/paiga/2/pai.png"'
                   + ' width="24" height="32" alt="_">'
                   + '</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('空白', ()=>{
            r.text = '#import(paiga)\n\n&paiga{ };\n';
            result = '<p><span class="l-mod-paiga" style="white-space:pre;">'
                   + ' </span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('不正な文字', ()=>{
            r.text = '#import(paiga)\n\n&paiga{&};\n';
            result = '<p><span class="l-mod-paiga" style="white-space:pre;">'
                   + '<span style="color:red;">&amp;</span>'
                   + '</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('副露面子', ()=>{
            r.text = '#import(paiga)\n\n&paiga{m1-23};\n';
            result = '<p><span class="l-mod-paiga" style="white-space:pre;">'
                   + '<img src="//kobalab.github.io/paiga/2/m1_.png"'
                   + ' width="32" height="24" alt="m1-">'
                   + '<img src="//kobalab.github.io/paiga/2/m2.png"'
                   + ' width="24" height="32" alt="m2">'
                   + '<img src="//kobalab.github.io/paiga/2/m3.png"'
                   + ' width="24" height="32" alt="m3">'
                   + '</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('暗槓', ()=>{
            r.text = '#import(paiga)\n\n&paiga{_p50_};\n';
            result = '<p><span class="l-mod-paiga" style="white-space:pre;">'
                   + '<img src="//kobalab.github.io/paiga/2/pai.png"'
                   + ' width="24" height="32" alt="_">'
                   + '<img src="//kobalab.github.io/paiga/2/p5.png"'
                   + ' width="24" height="32" alt="p5">'
                   + '<img src="//kobalab.github.io/paiga/2/p0.png"'
                   + ' width="24" height="32" alt="p0">'
                   + '<img src="//kobalab.github.io/paiga/2/pai.png"'
                   + ' width="24" height="32" alt="_">'
                   + '</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('加槓', ()=>{
            r.text = '#import(paiga)\n\n&paiga{s55=0-5};\n';
            result = '<p><span class="l-mod-paiga" style="white-space:pre;">'
                   + '<img src="//kobalab.github.io/paiga/2/s5.png"'
                   + ' width="24" height="32" alt="s5">'
                   + '<span style="display:inline-block;width:32px">'
                   + '<img src="//kobalab.github.io/paiga/2/s5_.png"'
                   + ' width="32" height="24"'
                   + ' style="vertical-align:bottom;display:block" alt="s5=">'
                   + '<img src="//kobalab.github.io/paiga/2/s0_.png"'
                   + ' width="32" height="24" alt="s0-">'
                   + '</span>'
                   + '<img src="//kobalab.github.io/paiga/2/s5.png"'
                   + ' width="24" height="32" alt="s5">'
                   + '</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('加槓(記述ミス) z111=1', ()=>{
            r.text = '#import(paiga)\n\n&paiga{z111=1};\n';
            result = '<p><span class="l-mod-paiga" style="white-space:pre;">'
                   + '<img src="//kobalab.github.io/paiga/2/z1.png"'
                   + ' width="24" height="32" alt="z1">'
                   + '<img src="//kobalab.github.io/paiga/2/z1.png"'
                   + ' width="24" height="32" alt="z1">'
                   + '<span style="display:inline-block;width:32px">'
                   + '<img src="//kobalab.github.io/paiga/2/z1_.png"'
                   + ' width="32" height="24"'
                   + ' style="vertical-align:bottom;display:block" alt="z1=">'
                   + '<img src="//kobalab.github.io/paiga/2/z1_.png"'
                   + ' width="32" height="24" alt="z1-">'
                   + '</span>'
                   + '</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('加槓(記述ミス) z777=', ()=>{
            r.text = '#import(paiga)\n\n&paiga{z777=};\n';
            result = '<p><span class="l-mod-paiga" style="white-space:pre;">'
                   + '<img src="//kobalab.github.io/paiga/2/z7.png"'
                   + ' width="24" height="32" alt="z7">'
                   + '<img src="//kobalab.github.io/paiga/2/z7.png"'
                   + ' width="24" height="32" alt="z7">'
                   + '<span style="display:inline-block;width:32px">'
                   + '<img src="//kobalab.github.io/paiga/2/z7_.png"'
                   + ' width="32" height="24"'
                   + ' style="vertical-align:bottom;display:block" alt="z7=">'
                   + '</span>'
                   + '</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('手牌(メンゼン)', ()=>{
            r.text = '#import(paiga)\n\n&paiga{m123p406s789z1122 z1};\n';
            result = '<p><span class="l-mod-paiga" style="white-space:pre;">'
                   + '<img src="//kobalab.github.io/paiga/2/m1.png"'
                   + ' width="24" height="32" alt="m1">'
                   + '<img src="//kobalab.github.io/paiga/2/m2.png"'
                   + ' width="24" height="32" alt="m2">'
                   + '<img src="//kobalab.github.io/paiga/2/m3.png"'
                   + ' width="24" height="32" alt="m3">'
                   + '<img src="//kobalab.github.io/paiga/2/p4.png"'
                   + ' width="24" height="32" alt="p4">'
                   + '<img src="//kobalab.github.io/paiga/2/p0.png"'
                   + ' width="24" height="32" alt="p0">'
                   + '<img src="//kobalab.github.io/paiga/2/p6.png"'
                   + ' width="24" height="32" alt="p6">'
                   + '<img src="//kobalab.github.io/paiga/2/s7.png"'
                   + ' width="24" height="32" alt="s7">'
                   + '<img src="//kobalab.github.io/paiga/2/s8.png"'
                   + ' width="24" height="32" alt="s8">'
                   + '<img src="//kobalab.github.io/paiga/2/s9.png"'
                   + ' width="24" height="32" alt="s9">'
                   + '<img src="//kobalab.github.io/paiga/2/z1.png"'
                   + ' width="24" height="32" alt="z1">'
                   + '<img src="//kobalab.github.io/paiga/2/z1.png"'
                   + ' width="24" height="32" alt="z1">'
                   + '<img src="//kobalab.github.io/paiga/2/z2.png"'
                   + ' width="24" height="32" alt="z2">'
                   + '<img src="//kobalab.github.io/paiga/2/z2.png"'
                   + ' width="24" height="32" alt="z2">'
                   + ' '
                   + '<img src="//kobalab.github.io/paiga/2/z1.png"'
                   + ' width="24" height="32" alt="z1">'
                   + '</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('手牌(副露あり)', ()=>{
            r.text = '#import(paiga)\n\n&paiga{s789z1122 z1 m3-12 p50-5};\n';
            result = '<p><span class="l-mod-paiga" style="white-space:pre;">'
                   + '<img src="//kobalab.github.io/paiga/2/s7.png"'
                   + ' width="24" height="32" alt="s7">'
                   + '<img src="//kobalab.github.io/paiga/2/s8.png"'
                   + ' width="24" height="32" alt="s8">'
                   + '<img src="//kobalab.github.io/paiga/2/s9.png"'
                   + ' width="24" height="32" alt="s9">'
                   + '<img src="//kobalab.github.io/paiga/2/z1.png"'
                   + ' width="24" height="32" alt="z1">'
                   + '<img src="//kobalab.github.io/paiga/2/z1.png"'
                   + ' width="24" height="32" alt="z1">'
                   + '<img src="//kobalab.github.io/paiga/2/z2.png"'
                   + ' width="24" height="32" alt="z2">'
                   + '<img src="//kobalab.github.io/paiga/2/z2.png"'
                   + ' width="24" height="32" alt="z2">'
                   + ' '
                   + '<img src="//kobalab.github.io/paiga/2/z1.png"'
                   + ' width="24" height="32" alt="z1">'
                   + ' '
                   + '<img src="//kobalab.github.io/paiga/2/m3_.png"'
                   + ' width="32" height="24" alt="m3-">'
                   + '<img src="//kobalab.github.io/paiga/2/m1.png"'
                   + ' width="24" height="32" alt="m1">'
                   + '<img src="//kobalab.github.io/paiga/2/m2.png"'
                   + ' width="24" height="32" alt="m2">'
                   + ' '
                   + '<img src="//kobalab.github.io/paiga/2/p5.png"'
                   + ' width="24" height="32" alt="p5">'
                   + '<img src="//kobalab.github.io/paiga/2/p0_.png"'
                   + ' width="32" height="24" alt="p0-">'
                   + '<img src="//kobalab.github.io/paiga/2/p5.png"'
                   + ' width="24" height="32" alt="p5">'
                   + '</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('ドラ表示', ()=>{
            r.text = '#import(paiga)\n\nドラ &paiga{s1m0___};\n';
            result = '<p>ドラ '
                   + '<span class="l-mod-paiga" style="white-space:pre;">'
                   + '<img src="//kobalab.github.io/paiga/2/s1.png"'
                   + ' width="24" height="32" alt="s1">'
                   + '<img src="//kobalab.github.io/paiga/2/m0.png"'
                   + ' width="24" height="32" alt="m0">'
                   + '<img src="//kobalab.github.io/paiga/2/pai.png"'
                   + ' width="24" height="32" alt="_">'
                   + '<img src="//kobalab.github.io/paiga/2/pai.png"'
                   + ' width="24" height="32" alt="_">'
                   + '<img src="//kobalab.github.io/paiga/2/pai.png"'
                   + ' width="24" height="32" alt="_">'
                   + '</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('空文字列', ()=>{
            r.text = '#import(paiga)\n\n&paiga{};\n';
            result = '<p><span class="l-mod-paiga" style="white-space:pre;">'
                   + '</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('サイズL', ()=>{
            r.text = '#import(paiga)\n\n&paiga(L){m1};\n';
            result = '<p><span class="l-mod-paiga" style="white-space:pre;">'
                   + '<img src="//kobalab.github.io/paiga/2/m1.png"'
                   + ' width="24" height="32" alt="m1">'
                   + '</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('サイズM', ()=>{
            r.text = '#import(paiga)\n\n&paiga(M){m1};\n';
            result = '<p><span class="l-mod-paiga" style="white-space:pre;">'
                   + '<img src="//kobalab.github.io/paiga/2/m1.png"'
                   + ' width="18" height="24" alt="m1">'
                   + '</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('サイズS', ()=>{
            r.text = '#import(paiga)\n\n&paiga(S){m1};\n';
            result = '<p><span class="l-mod-paiga" style="white-space:pre;">'
                   + '<img src="//kobalab.github.io/paiga/2/m1.png"'
                   + ' width="15" height="20" alt="m1">'
                   + '</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('サイズ指定', ()=>{
            r.text = '#import(paiga)\n\n&paiga(36x51){m1};\n';
            result = '<p><span class="l-mod-paiga" style="white-space:pre;">'
                   + '<img src="//kobalab.github.io/paiga/2/m1.png"'
                   + ' width="36" height="51" alt="m1">'
                   + '</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('サイズ指定(不正)', ()=>{
            r.text = '#import(paiga)\n\n&paiga(XL){m1};\n';
            result = '<p><span class="l-mod-paiga" style="white-space:pre;">'
                   + '<img src="//kobalab.github.io/paiga/2/m1.png"'
                   + ' width="24" height="32" alt="m1">'
                   + '</span></p>\n\n';
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });
});
