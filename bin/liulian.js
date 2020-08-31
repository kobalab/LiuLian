#!/usr/bin/env node

"use strict";

const path  = require('path');
const yargs = require('yargs');

const argv = yargs
    .usage('Usage: $0 <app-dir>')
    .option('port',     { alias: 'p', default: 3571 })
    .option('mount',    { alias: 'm'                })
    .demandCommand(1)
    .argv;
const home  = argv._[0];
const port  = argv.port;
const mount = argv.mount;

const locale   = require('../lib/util/locale')(
                            path.join(__dirname, '../locale'),
                            'en');
const auth     = require('../lib/auth/file')(
                            path.join(home, '/auth/local/passwd'));

const liulian  = require('../lib/liulian')({
                            locale: locale,
                            mount:  mount   });

const express  = require('express');
const session  = require('express-session')({
                            secret: 'keyboard cat',
                            resave: false,
                            saveUninitialized: false,
                            cookie: { maxAge: null }    });
const passport = require('../lib/auth/passport')(auth);
const login    = {
    local: passport.authenticate('local', {
                            successRedirect: './LOGIN?SUCESS',
                            failureRedirect: './LOGIN?ERROR'    })
};

const app = express();

if (mount) app.enable('trust proxy');
app.use(session);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({extended: false}));
app.post('/LOGIN', login.local);
app.use('/css', express.static(path.join(__dirname, '../css')));
app.use(liulian);

app.listen(port, ()=>{
    console.log(`Server start on http://127.0.0.1:${port}`);
}).on('error', (e)=>{
    console.error(''+e);
    process.exit(-1);
});
