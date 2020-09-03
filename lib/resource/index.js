/*
 *  resource
 */

const fs = require('fs');
const { join } = require('path');

const File   = require('./file');
const Folder = require('./folder');

module.exports = function(req) {
    return new Promise(function(resolve, reject) {
        const path = join(req.config.home, '/docs/', req.path);
        fs.stat(path, (err, stat)=>{
            if (err) return reject(404);
            if (stat.isDirectory()) resolve(new Folder(req, path, stat));
            else                    resolve(new File(req, path, stat));
        });
    });
};
