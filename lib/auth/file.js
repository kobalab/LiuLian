/*
 *  auth/file
 */
"use strict";

const fs = require('fs');

const crypto = require('crypto');

function digest(string) {
    return crypto.createHash('sha1').update(string).digest('hex');
}

class AuthFile {

    constructor(passwdFile) {
        this._ = {};
        for (let ent of fs.readFileSync(passwdFile, 'utf-8').split(/\n/)) {
            let [ user, passwd ] = ent.split(/:/);
            this._[user] = passwd;
        }
    }

    login(user, passwd) {
        return this._[user] == digest(passwd);
    }
}

module.exports = function(passwdFile) {
    return new AuthFile(passwdFile);
}
