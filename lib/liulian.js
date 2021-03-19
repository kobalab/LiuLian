/*
 *  liulian
 */
"use strict";

const version = require('../package.json').version;;

const Request  = require('./http/request');
const Response = require('./http/response');
const resource = require('./resource');

class LiuLian {

    constructor(config) {
        this._version = version;
        this._ = config;
        if (config.mount) {
            const [ mount, scheme, host, base ]
                        = config.mount.match(/^(.*?):\/\/([^\/]*)(.*?)\/?$/);
            this._mount = {
                scheme: scheme,
                host:   host,
                base:   base
            };
        }
    }
}

function adduser(req, res) {

    let user = req.param('user'), passwd = req.param('passwd');

    const auth = req.config.auth;
    if (auth.exist(user)) return res.error(400);

    auth.add(user, passwd);

    if (auth.exist(user)) return login(req, res);
    else return res.error(400);
}

function login(req, res) {

    const passport = req.config.passport;

    passport.authenticate('local', (err, user, info)=>{
        if (user) {
            req._req.login(user, (err)=>{
                if (err) res.error(500);
                else     {
                    req._req.session.cookie.path = req.baseUrl || '/';
                    res.redirect(303, req.path);
                }
            });
        }
        else res.error(401);
    })(req._req, res._res);
}

function logout(req, res) {

    if (req.param('session_id') != req.sessionID) return res.error(400);

    res._res.clearCookie('LIULIAN', { path: req.baseUrl || '/' });
    req._req.session.destroy();
    res.redirect(303, req.path);
}

async function get(req, res) {

    if (! req.config.auth.admin()) return res.adduser();

    if      (req.cmd == 'login')  return res.login();
    else if (req.cmd == 'logout') return logout(req, res);
    else if (req.cmd == 'debug')  return res.echo();

    try {
        let r = await resource(req);
        if (r.redirect) return res.redirect(...r.redirect);
        r = await r.open();
        r.send(res);
    }
    catch(err) {
        if (typeof err != 'number') console.log(err);
        res.error(err);
    }
}

async function post(req, res) {

    if (req.query == 'ADDUSER') return adduser(req, res);
    if (req.query == 'LOGIN') return login(req, res);
    if (req.cmd == 'debug')   return res.echo();

    try {
        if (req.param('session_id') != req.sessionID) return res.error(400);
        const r = await resource(req);
        await r.update();
        res.redirect(...r.redirect);
    }
    catch(err) {
        if (typeof err != 'number') console.log(err);
        res.error(err);
    }
}

module.exports = function(config) {

    const liulian = new LiuLian(config);

    return function(_req, _res, _next) {
        const req = new Request(liulian, _req);
        const res = new Response(req, _res);

        if      (req.method == 'GET')  get(req, res);
        else if (req.method == 'HEAD') get(req, res);
        else if (req.method == 'POST') post(req, res);
        else                           res.error(405);
    };
}
