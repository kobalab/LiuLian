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

const baseUrl = mount ? mount.replace(/^.*?:\/\/[^\/]*/,'') : '/';

const locale   = require('../lib/util/locale')(
                            path.join(__dirname, '../locale'),
                            'en');
const auth     = require('../lib/auth/file')(
                            path.join(home, '/auth/local/passwd'));

const liulian  = require('../lib/liulian')({
                            locale: locale,
                            mount:  mount   });

const express  = require('express');
const store    = new (require('session-file-store')(
                        require('express-session')))({
                                path: path.join(home, '/auth/session') });
const session  = require('express-session')({
                            secret: 'keyboard cat',
                            resave: false,
                            saveUninitialized: false,
                            store: store,
                            cookie: {
                                path: baseUrl,
                                maxAge: 1000*60*60*24*14
                            } });
const passport = require('../lib/auth/passport')(auth);
const login    = {
    local: passport.authenticate('local', {
                            successRedirect: './LOGIN?SUCESS',
                            failureRedirect: './LOGIN?ERROR'    })
};
const logout   = (req, res)=>{
    req.logout();
    req.session.destroy();
    res.redirect(303, './')
};

const app = express();

if (mount) app.enable('trust proxy');
app.use(session);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({extended: false}));
app.post('/LOGIN', login.local);
app.get('/LOGOUT', logout);
app.use('/css', express.static(path.join(__dirname, '../css')));
app.use(liulian);

app.listen(port, ()=>{
    console.log(`Server start on ${mount || `http://127.0.0.1:${port}`}`);
}).on('error', (e)=>{
    console.error(''+e);
    process.exit(-1);
});
