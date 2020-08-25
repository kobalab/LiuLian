#!/usr/bin/env node

"use strict";

const yargs   = require('yargs');
const express = require('express');

const argv = yargs
    .option('port',     { alias: 'p', default: 3571 })
    .option('mount',    { alias: 'm'                })
    .argv;
const port = argv['port'];
const mount = argv['mount'];

const path = require('path');
const locale_dir = path.join(__dirname, '../locale');
const locale = require('../lib/util/locale')(locale_dir, 'en');

const liulian = require('../lib/liulian');

const app = express();
if (mount) app.enable('trust proxy');
app.use('/css', express.static(path.join(__dirname, '../css')));
app.use(liulian({
    locale: locale,
    mount:  mount,
}));

app.listen(port, ()=>{
    console.log(`Server start on http://127.0.0.1:${port}/`);
}).on('error', (e)=>{
    console.error(''+e);
    process.exit(-1);
});
