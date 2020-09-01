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
        let data = this.users()
                        .map(user => user[0] == '#' ? user.substr(1) : user)
                        .map(user=>`${user}:${this._[user]}\n`)
                        .join('');
        fs.writeFile(this._filename, data, 'utf-8', ()=>{});
    }

    users() {
        if (! this._admin) return [];
        return [ this._admin ]
                .concat(
                    Object.keys(this._)
                        .filter(user => user != this._admin)
                        .sort()
                ).map(user => this._[user] == '*' ? '#' + user : user);
    }

    admin(user) {
        if (! user) return this._admin;
        if (this.exist(user)) this._admin = user;
        this.save();
    }

    exist(user) { return this._[user] !== undefined }

    add(user, passwd) {
        if (user.match(/:/))  return;
        if (this.exist(user)) return;
        this._[user] = passwd ? digest(passwd) : '*';
        if (! this._admin) this._admin = user;
        this.save();
    }

    del(user, force) {
        if (force) delete this._[user];
        else       this._[user] = '*';
        this.save();
    }

    passwd(user, passwd) {
        if (! this.exist(user)) return;
        this._[user] = digest(passwd);
        this.save();
    }

    validate(user, passwd) {
        return this._[user] == digest(passwd);
    }
}

module.exports = function(passwdFile) {
    return new AuthFile(passwdFile);
}
