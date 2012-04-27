var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    url = require('url'),
    path = require('path');
    
    app.listen(process.env.PORT || 8001);

function handler(req, res) {
    var fpath = req.url; 
    var contentType = 'text/html';
    var ua = req.headers['user-agent'];
    var url_parts = url.parse(req.url);
    var ext = path.extname(url_parts.pathname)
    
    if(/mobile/i.test(ua)) {
        fpath = '/mob/index.html';
    } else {
        fpath = '/cnv/index.html';
    }
    
    switch (ext) {
        case '.js':
            fpath = url_parts.href;
            contentType = 'text/javascript';
            break;
        case '.css':
            fpath = url_parts.href;
            contentType = 'text/css';
            break;
        case '.png':
            fpath = url_parts.href;
            contentType = 'image/png';
            break;
    }
    /*
    console.log(url_parts);
    if(url_parts.pathname == '/main.css') { 
        console.log(url_parts.href);
        fpath = url_parts.href; 
        contentType = 'text/css';
    }  */
    
    fs.readFile(__dirname + fpath, function(err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading '+__dirname + fpath);
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

io.sockets.on('connection', function(socket) {
    console.log('connected');
    
    socket.on('mobile', function(data) {
        try {       
            io.sockets.emit('desktop', data);
        } catch (Err) {
            console.log('skipping: ' + Err);
            return; // continue
        }
    });
});