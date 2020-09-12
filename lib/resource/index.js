/*
 *  resource
 */

const fs = require('fs');
const { join, basename } = require('path');
const mime = require('mime');

const File    = require('./file');
const Folder  = require('./folder');
const Text    = require('./text');
const LiuLian = require('./liulian');

module.exports = function(req) {
    return new Promise(function(resolve, reject) {
        const path = join(req.config.home, '/docs/',
                                            decodeURIComponent(req.path));
        fs.stat(path, (err, stat)=>{
            if (err) return reject(404);
            if (stat.isDirectory())     resolve(new Folder(req, path, stat));
            else if (! stat.isFile())   reject(406);
            else if ((mime.getType(path)||'').match(/^text\//))
                                        resolve(new Text(req, path, stat));
            else if (! basename(path).match(/\./))
                                        resolve(new LiuLian(req, path, stat));
            else                        resolve(new File(req, path, stat));
        });
    });
};
