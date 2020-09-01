/*
 *  auth/passport
 */
"use strict";

const passport = require('passport');

passport.serializeUser((user, done)=>done(null, user));
passport.deserializeUser((userstr, done)=>done(null, userstr));

const local = require('passport-local');
let auth;

passport.use(new local.Strategy(
    { usernameField: 'user',
      passwordField: 'passwd' },
    (user, passwd, done)=>{
        if (auth.validate(user, passwd)) done(null, user);
        else                        done(null, false);
    }
));

module.exports = function(_auth) {
    auth = _auth;
    return passport;
}
