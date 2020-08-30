#!/usr/bin/env node

"use strict";

const yargs   = require('yargs');
const express = require('express');
const session = require('express-session');

const argv = yargs
    .usage('Usage: $0 <app-dir>')
    .option('port',     { alias: 'p', default: 3571 })
    .option('mount',    { alias: 'm'                })
    .option('base',     { alias: 'b',               })
    .demandCommand(1)
    .argv;
const home  = argv._[0];
const port  = argv.port;
const mount = argv.mount;
const base  = (argv.base || '').replace(/\/$/,'');

const path = require('path');

const locale_dir = path.join(__dirname, '../locale');
const locale = require('../lib/util/locale')(locale_dir, 'en');

const auth_file = path.join(home, '/auth/local/passwd');
const auth = require('../lib/auth/file')(auth_file);

const passport = require('../lib/auth/passport')(auth);

const liulian = require('../lib/liulian');

const app = express();
if (mount) app.enable('trust proxy');
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: null }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({extended: false}));
app.post(`${base}/LOGIN`,
    passport.authenticate('local', {
        successRedirect: './LOGIN?SUCESS',
        failureRedirect: './LOGIN?ERROR'
    })
);
app.use(`${base}/css`, express.static(path.join(__dirname, '../css')));
app.use(base, liulian({
    locale: locale,
    mount:  mount,
}));

app.listen(port, ()=>{
    console.log(`Server start on http://127.0.0.1:${port}${base}`);
}).on('error', (e)=>{
    console.error(''+e);
    process.exit(-1);
});
