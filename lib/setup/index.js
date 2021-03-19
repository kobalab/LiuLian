/*
 *  setup
 */
"use strict";

const fs   = require('fs');
const path = require('path');

const dirs = [
    [ 'auth'            ],
    [ 'auth', 'local'   ],
    [ 'auth', 'session' ],
    [ 'docs'            ],
    [ 'tmp'             ],
];
const files = [
    [ 'auth', 'local', 'passwd' ],
];

function mkdir(dir) { if (! fs.existsSync(dir)) fs.mkdirSync(dir) }

function setup(home) {
    mkdir(home);
    for (let dir of dirs) {
        mkdir(path.join(home, ...dir));
    }
    for (let file of files) {
        fs.appendFileSync(path.join(home, ...file), '');
    }
}

module.exports = setup;
