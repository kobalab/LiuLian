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

function resource(req, file) {
    return new Promise(function(resolve, reject) {
        let location;
        if (file) {
            if (file.match(/^\/\//)) return reject(404);
            if (file.match(/^\//))
                    location = file;
            else    location = decodeURIComponent(join(req.pathDir, file));
        }
        else        location = decodeURIComponent(req.path);
        const path = join(req.config.home, '/docs/', location);

        fs.stat(path, (err, stat)=>{
            if (err) return reject(404);

            if (stat.isDirectory())
                    resolve(new Folder(req, path, stat, location, resource));
            else if (! stat.isFile())
                    reject(406);
            else if ((mime.getType(path)||'').match(/^text\//))
                    resolve(new Text(req, path, stat, location, resource));
            else if (! basename(path).match(/\./))
                    resolve(new LiuLian(req, path, stat, location, resource));
            else    resolve(new File(req, path, stat, location, resource));
        });
    });
};

module.exports = resource;
