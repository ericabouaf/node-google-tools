var htmlparser = require('htmlparser'),
    request = require('request'),
    querystring = require('querystring');

// Generate a string from a structure as output by htmlparser
var domNodeToString = function(node) {
   
   if (node.type == "text") {
      return node.data;
   }
   else if(node.type == "tag") {
      
      var pre = "<"+node.name,
          post = "</"+node.name+">";
      
      for(var attribName in node.attribs) {
         if(attribName != "style") { // Hack to remove style="..."
            pre += " "+attribName+"=\""+node.attribs[attribName]+"\"";
         }
      }
      pre += ">";
      
      if(node.children) {
         node.children.forEach(function(c) {
            pre += domNodeToString(c);
         });
      }
      return pre+post;
   } 
};

// Generate the result set from the dom returned by htmlparser
formatGoogleResponse = function(dom) {
   
    var results = [], nResults;
    
    var walk = function(node_list, indent) {
       
       for(var i = 0 ; i < node_list.length ; i++) {
          var node = node_list[i];
             
          if(!!node.attribs && !!node.attribs.id) {
                  if(node.attribs.id == "resultStats") {
                       try {
                          nResults =  node.children[0].data.replace(/&#160;/g, '').replace(/&nbsp;/g, '');
                       } catch(ex) {}
                  }
                  
                  if(node.attribs.id == "ires") {
                       try {
                          results = node.children[0].children;
                       } catch(ex) {}
                  }
          }
          
          // Recurse :
          if(node.children) {
             walk(node.children, indent+"  ");
          } 
       }
    };
    walk(dom, "");
    
    
    
    var formatted = [];
    
    results.forEach(function(r) {
       
       // Title
       var htmlTitle = domNodeToString({
          type: 'tag',
          name: 'h3',
          children: r.children[0].children[0].children
       });
       
       // Content & description
       var htmlSnippet, links;
       if(r.children.length > 1) {
          
          var node = r.children[1];
          
          // Parse the "classic" case
          if(node.type == "tag" && node.name == "div" && !!node.attribs && node.attribs["class"] == "s") {
             
             htmlSnippet = domNodeToString({
                type: 'tag',
                name: 'div',
                children: r.children[1].children.slice(0,-1)
             });
             
             links = domNodeToString({
                type: 'tag',
                name: 'div',
                children: [r.children[1].children[r.children[1].children.length - 1] ]
             });
             
          }
          else {
             htmlSnippet = domNodeToString(r.children[1]);
          }
          
       }
       
       // URL
      var trTitle = r.children[0].children[0];
      var titleLink;
      if(trTitle.attribs) {
        titleLink = trTitle.attribs.href; // /url?
      }
      else {
        titleLink = trTitle.children[0].children[0].children[0].attribs.href;
      }
       var par = {};
       if(titleLink) {
          if(titleLink.substr(0,5) === "/url?") {
            par = querystring.parse(titleLink.substr(5));
          }
          else if (titleLink.substr(0,7) === "/images") {
            par.q = 'http://www.google.com'+titleLink;
          }
       }
       
       // Push result
       formatted.push({
          link: par.q,
          htmlTitle: htmlTitle,
          title: htmlTitle.replace(/<(?:.|\n)*?>/gm, ''),
          htmlSnippet: htmlSnippet,
          snippet: htmlSnippet ? htmlSnippet.replace(/<(?:.|\n)*?>/gm, '') : '',
          links: links
       });
       
    });
    
    if(nResults) {
        nResults = parseInt(nResults.match(/ ([\d, ]+)/)[1].replace(/[ ,]/g,''),10);
   }
    
    return {
        nResults: nResults,
        results: formatted
     };
};


exports.search = function (opts, cb) {
   
   var p = {
      q: opts.q
   };

   for(var k in opts) {
      p[k] = opts[k];
   }

   if(!p.hl) {
      p.hl = 'en';
   }

   var url = 'http://www.google.com/search?'+querystring.stringify(p);

   request(url, function (error, response, body) {
      if (error) {
          cb(error, null);
          return;
      }
      else if (response.statusCode == 200) {

         var handler = new htmlparser.DefaultHandler(function (error, dom) {
             if (error) {
                cb(error, null);
                return;
             }
             else {
                var results = formatGoogleResponse(dom);
                
                cb(null, results);
                
             }
         }, { 
            verbose: false, 
            ignoreWhitespace: true 
         });
         var parser = new htmlparser.Parser(handler);
         parser.parseComplete(body);
     }

   });
   
};
