/*
 *  backup/git
 */
"use strict";

const path     = require('path');
const fs       = require('fs');
const execSync = require('child_process').execFileSync;
const exec     = require('util').promisify(require('child_process').execFile);

class Git {

    constructor(repodir) {
        let git_dir   = path.join(repodir, '.git');
        this._option  = [ '--git-dir=' + git_dir, '--work-tree=' + repodir ];
        fs.statSync(git_dir);
        execSync('git', this._option.concat('init'));
        try {
            execSync('git', this._option.concat('log'));
        }
        catch(e) {
            execSync('git', this._option.concat([
                                    'commit','--allow-empty','-m','.']));
        }
    }

    async checkIn(location, time, user) {
        let path = location.replace(/^\//,'');
        let log  = await exec('git', this._option.concat([
                                    'log','--oneline','--', path]));
        let diff = await exec('git', this._option.concat(['diff','--', path]));
        if (! log.stdout || diff.stdout) {
            await exec('git', this._option.concat(['add', path]));
            await exec('git', this._option.concat([
                                    'commit','-m', `${time}:${user}`]));
        }
    }

    async checkOut(location, rev) {
        let path = location.replace(/^\//,'');
        let rv = await exec('git', this._option.concat([
                                        'show',`${rev}:${path}`]));
        return rv.stdout;
    }

    async log(location) {
        let path = location.replace(/^\//,'');
        let rv = await exec('git', this._option.concat([
                            'log','--pretty=format:%h\t%s','--', path]));
        let log = [];
        if (! rv.stdout) return log;
        for (let line of rv.stdout.split(/\n/)) {
            let [rev, comment] = line.split(/\t/);
            let [time, user] = comment.split(/:/);
            log.push({ rev: rev, time: +time, user: user });
        }
        return log;
    }

    async diff(location, rev1, rev2) {
        let rv;
        let path = location.replace(/^\//,'');
        if (rev2) {
            rv = await exec('git', this._option.concat([
                                    'diff',`${rev1}..${rev2}`,'--', path]));
        }
        else {
            rv = await exec('git', this._option.concat([
                                    'diff', rev1, '--', path]));
        }
        let diff = [], body;
        for (let line of rv.stdout.split(/\n/)) {
            if (line.match(/^@@/)) body = 1;
            if (! body) continue;
            diff.push(line);
        }
        return diff;
    }
}

module.exports = function(repodir) {
    try {
        return new Git(repodir);
    }
    catch(e) {
        return;
    }
}
