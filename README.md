# google-pack

## Usage

    var google = require('google-tools');

    // Get pagerank
    google.pagerank({
      url: 'http://www.github.com/'
    }, function(err, r) {
        console.log(err, r);
    });

    // Google search
    google.search({
        //as_epq: 'google search options',
        //lr: 'fr'
        q: 'google search options',
        num: 50, // max 100
        hl: 'fr'
    }, function(err, r) {
        console.log(err, r);
    });

    google.pagerankAvg({
        q: 'cool keywords',
        num: 20
    }, function(err, r) {
        console.log(err, r);
    });

    google.position({
        url: 'http://en.wikipedia.org',
        q: 'tomato',
        num: 100, // maximum position
        start: 0
    }, function(err, r) {
        console.log(err, r);
    });

    google.suggest({
        q: 'roger federer'
    }, function(err, r) {
        console.log(err, r);
    });

    google.deep_suggest({
        q: 'roger federer'
    }, function(err, r) {
        console.log(err, r);
    });


    google.search({
        q: 'related:www.clicrdv.com'
    }, function(err, r) {
        console.log(err, r);
    });


    google.search({
        q: 'site:www.amazon.com',
        num: 100
    }, function(err, r) {
        console.log(err, r);
    });

    google.search({
        q: 'inurl:nodejs',
        num: 100
    }, function(err, r) {
        console.log(err, r);
    });



For a full list of google search parameters, cf  http://www.rankpanel.com/blog/google-search-parameters/
