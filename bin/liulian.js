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

require('../lib/setup')(home);

const locale   = require('../lib/util/locale')(
                            path.join(__dirname, '../locale'),
                            'en');
const auth     = require('../lib/auth/file')(
                            path.join(home, '/auth/local/passwd'));

const express  = require('express');
const store    = new (require('session-file-store')(
                        require('express-session')))({
                                path: path.join(home, '/auth/session') });
const session  = require('express-session')({
                            name:   'LIULIAN',
                            secret: 'keyboard cat',
                            resave: false,
                            saveUninitialized: false,
                            store: store,
                            cookie: { maxAge: 1000*60*60*24*14 } });
const upload   = require('multer')({
                            dest:   path.join(home, '/tmp') });
const passport = require('../lib/auth/passport')(auth);

const liulian  = require('../lib/liulian')({
                            home:     home,
                            locale:   locale,
                            mount:    mount,
                            passport: passport  });

const app = express();

if (mount) app.enable('trust proxy');
app.disable('x-powered-by');
app.use(session);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ limit: '4mb', extended: false }));
app.use('/css', express.static(path.join(__dirname, '../css')));
app.use(upload.fields([{name: 'file'}]));
app.use(liulian);

app.listen(port, ()=>{
    console.log(`Server start on ${mount || `http://127.0.0.1:${port}`}`);
}).on('error', (e)=>{
    console.error(''+e);
    process.exit(-1);
});
