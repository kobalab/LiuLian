/*
 *  backup/git
 */
"use strict";

const path     = require('path');
const fs       = require('fs');
const execSync = require('child_process').execSync;
const exec     = require('util').promisify(require('child_process').exec);

class Git {

    constructor(repodir) {
        let git_dir   = path.join(repodir, '.git');
        let work_tree = repodir;
        this._option  = `--git-dir=${git_dir} --work-tree=${work_tree}`;
        fs.statSync(git_dir);
        execSync(`git ${this._option} init`);
    }

    async checkIn(path, user) {
        await exec(`git ${this._option} add ${path}`);
        await exec(`git ${this._option} commit -m "${user}"`);
    }

    async checkOut(path, rev) {
        let rv = await exec(`git ${this._option} show ${rev}:${path}`);
        return rv.stdout;
    }

    async log(path) {
        const opt = '--date=unix --pretty=format:"%h\t%cd\t%s"'
        let rv = await exec(`git ${this._option} log ${opt} -- ${path}`);
        let log = [];
        for (let line of rv.stdout.split(/\n/)) {
            let [rev, time, user] = line.split(/\t/);
            log.push({ rev: rev, time: time * 1000, user: user });
        }
        return log;
    }

    async diff(path, rev1, rev2) {
        let rv;
        if (rev2) {
            rv = await exec(`git ${this._option} diff ${rev1}..${rev2} `
                            + `-- ${path}`);
        }
        else {
            rv = await exec(`git ${this._option} diff ${rev1} -- ${path}`);
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
