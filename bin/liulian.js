#!/usr/bin/env node

"use strict";

const yargs   = require('yargs');
const express = require('express');

const argv = yargs
    .option('port',     { alias: 'p', default: 3571 })
    .argv;

const port = argv['port'];

const path = require('path');
const locale
    = require('../lib/util/locale')(path.join(__dirname, '../locale'), 'en');

const app = express();
app.get('/', (req, res)=>{
    let greeting = locale(req.acceptsLanguages())('greeting');
    res.send(`<h1>${greeting}</h1>`);
});

app.listen(port, ()=>{
    console.log(`Server start on http://127.0.0.1:${port}/`);
}).on('error', (e)=>{
    console.error(''+e);
    process.exit(-1);
});
