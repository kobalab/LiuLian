/*
 *  util/secret.js
 */
"use strict";

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

function make_secret(dir) {

    const secret = crypto.randomBytes(32).toString('hex');

    const filename = path.join(dir, 'secret');
    if (! fs.existsSync(filename)) {
        fs.writeFileSync(filename, secret, 'utf-8');
        fs.chmodSync(filename, 0o400);
    }
    return fs.readFileSync(filename);
}

module.exports = make_secret;
