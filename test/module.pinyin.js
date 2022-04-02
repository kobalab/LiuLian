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

suite('module/pinyin', ()=>{

    suite('pinyin - 声調記号つきのピンインを出力する', ()=>{
        const c = 'class="l-mod-pinyin"';
        test('全声調記号', ()=>{
            r.text = '#import(pinyin)\n\n'
                   + '&pinyin{a1 a2 a3 a4 e1 e2 e3 e4 o1 o2 o3 o4};\n'
                   + '&pinyin{i1 i2 i3 i4 u1 u2 u3 u4 v1 v2 v3 v4};\n'
                   + '&pinyin{n1 n2 n3 n4};\n';
            result = `<p><span ${c}>ā á ǎ à ē é ě è ō ó ǒ ò</span>\n`
                   + `<span ${c}>ī í ǐ ì ū ú ǔ ù ǖ ǘ ǚ ǜ</span>\n`
                   + `<span ${c}>n̄ ń ň ǹ</span></p>\n\n`;
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('全声調記号(大文字)', ()=>{
            r.text = '#import(pinyin)\n\n'
                   + '&pinyin{A1 A2 A3 A4 E1 E2 E3 E4 O1 O2 O3 O4};\n'
                   + '&pinyin{I1 I2 I3 I4 U1 U2 U3 U4 V1 V2 V3 V4};\n'
                   + '&pinyin{N1 N2 N3 N4};\n';
            result = `<p><span ${c}>Ā Á Ǎ À Ē É Ě È Ō Ó Ǒ Ò</span>\n`
                   + `<span ${c}>Ī Í Ǐ Ì Ū Ú Ǔ Ù Ǖ Ǘ Ǚ Ǜ</span>\n`
                   + `<span ${c}>N̄ Ń Ň Ǹ</span></p>\n\n`;
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('単母音', ()=>{
            r.text = '#import(pinyin)\n\n'
                   + '&pinyin{a1 e1 o1 yi1 wu1 yu1};\n'
                   + '&pinyin{A1 E1 O1 YI1 WU1 YU1};\n';
            result = `<p><span ${c}>ā ē ō yī wū yū</span>\n`
                   + `<span ${c}>Ā Ē Ō YĪ WŪ YŪ</span></p>\n\n`;
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('単母音(子音あり)', ()=>{
            r.text = '#import(pinyin)\n\n'
                   + '&pinyin{ba1 ne1 bo1 bi1 bu1 nv1};\n'
                   + '&pinyin{BA1 NE1 BO1 BI1 BU1 NV1};\n';
            result = `<p><span ${c}>bā nē bō bī bū nǖ</span>\n`
                   + `<span ${c}>BĀ NĒ BŌ BĪ BŪ NǕ</span></p>\n\n`;
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('二重母音', ()=>{
            r.text = '#import(pinyin)\n\n'
                   + '&pinyin{ai2 ei2 ao2 ou2 ya2 ye2 wa2 wo2 yue2};\n'
                   + '&pinyin{AI2 EI2 AO2 OU2 YA2 YE2 WA2 WO2 YUE2};\n';
            result = `<p><span ${c}>ái éi áo óu yá yé wá wó yué</span>\n`
                   + `<span ${c}>ÁI ÉI ÁO ÓU YÁ YÉ WÁ WÓ YUÉ</span></p>\n\n`;
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('二重母音(子音あり)', ()=>{
            r.text = '#import(pinyin)\n\n'
                   + '&pinyin{bai2 bei2 bao2 bou2 jia2 jie2 gua2 guo2 lve2};\n'
                   + '&pinyin{BAI2 BEI2 BAO2 BOU2 JIA2 JIE2 GUA2 GUO2 LVE2};\n';
            result =
                `<p><span ${c}>bái béi báo bóu jiá jié guá guó lüé</span>\n`
              + `<span ${c}>BÁI BÉI BÁO BÓU JIÁ JIÉ GUÁ GUÓ LÜÉ</span></p>\n\n`;
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('三重母音', ()=>{
            r.text = '#import(pinyin)\n\n'
                   + '&pinyin{yao3 you3 wai3 wei3};\n'
                   + '&pinyin{YAO3 YOU3 WAI3 WEI3};\n';
            result = `<p><span ${c}>yǎo yǒu wǎi wěi</span>\n`
                   + `<span ${c}>YǍO YǑU WǍI WĚI</span></p>\n\n`;
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('三重母音(子音あり)', ()=>{
            r.text = '#import(pinyin)\n\n'
                   + '&pinyin{jiao3 jiu3 guai3 gui3};\n'
                   + '&pinyin{JIAO3 JIU3 GUAI3 GUI3};\n';
            result = `<p><span ${c}>jiǎo jiǔ guǎi guǐ</span>\n`
                   + `<span ${c}>JIǍO JIǓ GUǍI GUǏ</span></p>\n\n`;
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('鼻母音', ()=>{
            r.text = '#import(pinyin)\n\n'
                   + '&pinyin{an4 en4 ang4 eng4 yan4 yin4 yang4 ying4};\n'
                   + '&pinyin{wan4 wen4 wang4 weng4 yuan4 yun4 yong4};\n'
                   + '&pinyin{AN4 EN4 ANG4 ENG4 YAN4 YIN4 YANG4 YING4};\n'
                   + '&pinyin{WAN4 WEN4 WANG4 WENG4 YUAN4 YUN4 YONG4};\n';
            result = `<p><span ${c}>àn èn àng èng yàn yìn yàng yìng</span>\n`
                   + `<span ${c}>wàn wèn wàng wèng yuàn yùn yòng</span>\n`
                   + `<span ${c}>ÀN ÈN ÀNG ÈNG YÀN YÌN YÀNG YÌNG</span>\n`
                   + `<span ${c}>WÀN WÈN WÀNG WÈNG YUÀN YÙN YÒNG</span></p>\n\n`;
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('鼻母音(子音あり)', ()=>{
            r.text = '#import(pinyin)\n\n'
                   + '&pinyin{ban4 ben4 bang4 beng4 jian4 jin4 jiang4 jing4};\n'
                   + '&pinyin{guan4 gun4 guang4 gong4 xuan4 xun4 xiong4};\n'
                   + '&pinyin{BAN4 BEN4 BANG4 BENG4 JIAN4 JIN4 JIANG4 JING4};\n'
                   + '&pinyin{GUAN4 GUN4 GUANG4 GONG4 XUAN4 XUN4 XIONG4};\n';
            result =
                `<p><span ${c}>bàn bèn bàng bèng jiàn jìn jiàng jìng</span>\n`
              + `<span ${c}>guàn gùn guàng gòng xuàn xùn xiòng</span>\n`
              + `<span ${c}>BÀN BÈN BÀNG BÈNG JIÀN JÌN JIÀNG JÌNG</span>\n`
              + `<span ${c}>GUÀN GÙN GUÀNG GÒNG XUÀN XÙN XIÒNG</span></p>\n\n`;
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('区切りの追加', ()=>{
            r.text = '#import(pinyin)\n\n'
                   + '&pinyin{Xi1an4};\n';
            result = `<p><span ${c}>Xī-àn</span></p>\n\n`;
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('軽声', ()=>{
            r.text = '#import(pinyin)\n\n'
                   + '&pinyin{shen2me};\n';
            result = `<p><span ${c}>shénme</span></p>\n\n`;
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('Ng', ()=>{
            r.text = '#import(pinyin)\n\n'
                   + '&pinyin{Ng2};\n';
            result = `<p><span ${c}>Ńg</span></p>\n\n`;
            return liulian(r).then(html=>assert.equal(html, result));
        });
        test('ブロックモジュール', ()=>{
            r.text = '#import(pinyin)\n\n'
                   + '#pinyin<<++\n'
                   + 'Ni2hao3!\n'
                   + '++\n';
            result = `<div ${c}><p>Níhǎo!</p>\n</div>`;
            return liulian(r).then(html=>assert.equal(html, result));
        });
    });
});
