/*
 *  util/str-tool
 */

function timeStr(time) {

    const now  = new Date().getTime();

    const date = new Date(time);
    const year = date.getFullYear();
    const m    = date.getMonth() + 1;
    const mm   = ('0' + m).substr(-2);
    const d    = date.getDate();
    const dd   = ('0' + d).substr(-2);
    const hour = ('0' + date.getHours()).substr(-2);
    const min  = ('0' + date.getMinutes()).substr(-2);

    if      (now - time < 1000*60*60*12)    return `${hour}:${min}`;
    else if (now - time < 1000*60*60*24*365/2)
                                            return `${m}/${d} ${hour}:${min}`;
    else                                    return `${year}/${mm}/${dd}`;
}

function sizeStr(size) {

    if (size == null) return '-';

    let str;
    for (let unit of ['',' KB',' MB',' GB',' TB']) {
        str = unit ? size.toFixed(1) + unit : size + unit;
        if (size < 1024) return str;
        size = size / 1024;
    }
    return str;
}

module.exports = {
    timeStr: timeStr,
    sizeStr: sizeStr,
};
