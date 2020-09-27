/*
 *  resource
 */

const fs = require('fs').promises;
const { join, basename } = require('path');
const mime = require('mime');

const File    = require('./file');
const Folder  = require('./folder');
const Text    = require('./text');
const LiuLian = require('./liulian');

async function resource(req, file) {
    let location;
    if (file) {
        if (file.match(/^\/\//)) throw 404;
        if (file.match(/^\//))
                location = file;
        else    location = decodeURIComponent(req.pathDir + file);
    }
    else        location = decodeURIComponent(req.path);
    const path = join(req.config.home, '/docs/', location);

    try {
        const stat = await fs.stat(path);
        if (stat.isDirectory())     return new Folder(req, path, stat,
                                                      location, resource);
        else if (! stat.isFile())   throw 404;
        else if ((mime.getType(path)||'').match(/^text\//))
                                    return new Text(req, path, stat,
                                                    location, resource);
        else if (! basename(path).match(/\./))
                                    return new LiuLian(req, path, stat,
                                                       location, resource);
        else                        return new File(req, path, stat,
                                                    location, resource);
    }
    catch(err) {
        throw 404;
    }
};

module.exports = resource;
