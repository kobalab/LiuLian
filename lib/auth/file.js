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

    constructor(filename) {
        this._filename = filename;
        this._ = {};
        for (let ent of fs.readFileSync(filename, 'utf-8').split(/\n/)) {
            if (! ent) continue;
            let [ user, passwd ] = ent.split(/:/);
            this._[user] = passwd;
            if (! this._admin) this._admin = user;
        }
    }

    save() {
        fs.writeFile(
            this._filename,
            Object.keys(this._).map(user=>`${user}:${this._[user]}\n`).join(''),
            'utf-8',
            ()=>{}
        );
    }

    admin(user) {
        if (! user)                return this._admin;
        else if (this.exist(user)) this._admin = user;
    }

    exist(user) { return this._[user] !== undefined }

    add(user, passwd) {
        if (this.exist(user)) return;
        this._[user] = digest(passwd);
        if (! this._admin) this._admin = user;
        this.save();
    }

    del(user, force) {
        if (force) delete this._[user];
        else       this._[user] = '*';
        this.save();
    }

    validate(user, passwd) {
        return this._[user] == digest(passwd);
    }

    length() {
        return Object.keys(this._).length;
    }
}

module.exports = function(passwdFile) {
    return new AuthFile(passwdFile);
}
