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

    const cmd = req.param('cmd');
    if      (cmd == 'login')  return res.login();
    else if (cmd == 'logout') return logout(req, res);
    else if (cmd == 'debug')  return res.echo();

    try {
        const r = await resource(req, res);
        await r.open();
        r.send(res);
    }
    catch(code) {
        if (typeof code != 'number') console.log(code);
        res.error(code);
    }
}

function post(req, res) {

    if (req.query == 'LOGIN') return login(req, res);

    res.send();
}

module.exports = function(config) {

    const liulian = new LiuLian(config);

    return function(req, res, next) {
        const _req = new Request(liulian, req);
        const _res = new Response(_req, res);

        if      (_req.method == 'GET')  get(_req, _res);
        else if (_req.method == 'HEAD') get(_req, _res);
        else if (_req.method == 'POST') post(_req, _res);
        else                            _res.error(405);
    };
}
