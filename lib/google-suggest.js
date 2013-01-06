var http = require('http'),
    querystring = require('querystring');

suggest = exports.suggest = function(q, cb) {
   
   var req = http.request({
      host: 'www.google.com',
      port: 80,
      path: '/s?'+querystring.stringify({ q: q.q }), 
      method: 'GET'
    }, function(res) {
     res.setEncoding('utf8');
     var body = "";
     res.on('data', function (chunk) { body += chunk; });
     res.on('end', function() {
        var items;
        body = body.substr(19, body.length-19-1); // remove the jsonp callback
        try {
           items = JSON.parse(body)[1].map(function(k) { return k[0]; });
        }
        catch(ex) {
           cb(ex, null);
        }
        
        cb(null, items);
     });
   });
   req.on('error', function(e) { cb(null, e); });
   req.end();
};


