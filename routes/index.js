var express = require('express');
var router = express.Router();
var extend = require('extend');
var cheerio = require('cheerio');
var request = require('request');
var j = request.jar();
var cookie = request.cookie('auth_token=' + process.env.AUTH_TOKEN);

router.get('/', function (req, res, next) {
  var json = {};

  res.render('index', {json: json});
});

router.get('/token', function (req, res, next) {
  res.render('token');
}).post('/token', function (req, res, next) {
  process.env.AUTH_TOKEN = req.body.token;
  res.redirect('/');
});

router.get('/browse/new', function (req, res, next) {
  var url = 'http://gospelink.com/browse/new';

  j.setCookie(cookie, url);

    request({url: url, jar: j}, function(error, response, html){
    if(!error) {
      var $ = cheerio.load(html);

            var json = { 
              books: []
            };

            $('#main .browse_content li').each(function (index) {
              json.books.push( {text: $(this).text(), href: $(this).children('a').attr('href')} );
            });
          
    } else {
      res.sendStatus(500);
    }


    res.format({
      json: function () {
            res.status(200).send(json);
      },
      html: function () {
            res.render('browseNew', {json: json});
      }
    });
  });
});

router.get('/lessons', function (req, res, next) {
  var url = 'http://gospelink.com/lessons';

  j.setCookie(cookie, url);

    request({url: url, jar: j}, function(error, response, html){
    if(!error) {
      var $ = cheerio.load(html);

            var json = { 
              lessons: []
            };
            
            $('#main .browse_content > li').each(function (index) {
              var links = [];

              $(this).find('ul.browse_inner > li > a').each(function (index) {
                links.push({
                  text: $(this).text(),
                  href: $(this).attr('href')
                });
              });

              json.lessons.push({
                text: $(this).children('h4').text(),
                links: links
              });
            });
          
    } else {
      res.sendStatus(500);
    }

    res.format({
      json: function () {
            res.status(200).send(json);
      },
      html: function () {
            res.render('lessons', {json: json});
      }
    });
  });
});

router.get('/library/document/:doc', function (req, res, next){

  var url = 'http://gospelink.com/library/document/' + req.params.doc;

  j.setCookie(cookie, url);

    request({url: url, jar: j}, function(error, response, html){

        if(!error){
            var $ = cheerio.load(html);

            var anchors = $('a');

            for (var i = anchors.length - 1; i >= 0; i--) {
              if (anchors[i].attribs.href === '/users/login') {
                return res.redirect('/token');
              };
            };

            var json = { 
              prev: "",
              next: "",
              chapterTitle: "",
              bookTitle: "",
              authors: [],
              coverImage: "",
              paragraphs: []
            };

            $('#main .read').children().each( function (index) {
              $(this).children().remove('span');
              if ($(this).hasClass('Chapter')) {
                json.chapterTitle = $(this).text();
              } else {
                json.paragraphs.push (
                  {
                    text: $(this).html(), 
                    classes: $(this).attr('class'), 
                    id: $(this).attr('id'),
                    tag: $(this).get(0).tagName
                  }
                );
              };
            });

            json.bookTitle = $('.sidebar h2').text();
            $('.sidebar h5 a').each(function (index) {
              json.authors.push( {text: $(this).text(), href: $(this).attr('href')} );
            });
            json.coverImage = 'http://gospelink.com' + $('.current_book img').attr('src');

            if ($('.nav_chapter .left a').attr('href') != undefined) {
              json.prev = $('.nav_chapter .left a').attr('href');
            };
            if ($('.nav_chapter .right a').attr('href') != undefined) {
              json.next = $('.nav_chapter .right a').attr('href');
            };

        } else {
        res.sendStatus(500);
        }


    res.format({
      json: function () {
            res.status(200).send(json);
      },
      html: function () {
            res.render('libraryDocument', {json: json});
      }
    });
    });
});

router.get('/library/contents/:doc', function (req, res, next) {
  var url = 'http://gospelink.com/library/contents/' + req.params.doc;

  j.setCookie(cookie, url);

  request({url: url, jar: j}, function(error, response, html){
    if(!error) {
      var $ = cheerio.load(html);

            var json = { 
              title: '',
              author: '',
              copyright: '',
              coverImage: '',
              toc: []
            };

            json.title = $('.book_title h1').text();
            json.author = $('.book_title h2').text();
            json.copyright = $('.copyright').text();
            json.coverImage = 'http://gospelink.com' + $('.current_book img').attr('src');

            $('.sidebar_inner .container li a').each(function (index) {
              var re = /library\/sell\/(\d*)\'/;
              var chapter = '';
              var str = $(this).attr('onclick');
              if (str !== undefined) {
                chapter = '/library/document/' + str.match(re, '$1')[1];
              } else {
                chapter = $(this).attr('href');
              };
              json.toc.push( {text: $(this).text(), href: chapter} );
            });

    } else {
      res.sendStatus(500);
    }


    res.format({
      json: function () {
            res.status(200).send(json);
      },
      html: function () {
            res.render('libraryContents', {json: json});
      }
    });
  });
});

router.get('/browse/authors', function (req, res, next) {
  var url = 'http://gospelink.com/browse/authors?sort=' + req.query.sort;

  j.setCookie(cookie, url);

  request({url: url, jar: j}, function(error, response, html){
    if(!error) {
      var $ = cheerio.load(html);

            var json = { 
              authors: [],
              alphaLinks: []
            };

            $('#main > div > a').each(function (index) {
              json.alphaLinks.push( {text: $(this).text(), href: $(this).attr('href')} );
            });

            $('#main .browse_content li').each(function (index) {
              json.authors.push( {text: $(this).text(), href: $(this).children('a').attr('href')} );
            });

    } else {
      res.render('error');
    }


    res.format({
      json: function () {
            res.status(200).send(json);
      },
      html: function () {
            res.render('browseByAuthor', {json: json});
      }
    });
  });
});

router.get('/browse/author/:author', function (req, res, next) {
  var url = 'http://gospelink.com/browse/author/' + req.params.author;

  j.setCookie(cookie, url);

  request({url: url, jar: j}, function(error, response, html){
    if(!error) {
      var $ = cheerio.load(html);

            var json = { 
              books: [],
              alphaLinks: [],
              author: ""
            };

            $('#main > div > a').each(function (index) {
              json.alphaLinks.push( {text: $(this).text(), href: $(this).attr('href')} );
            });

            $('#main .browse_content li').each(function (index) {
              json.books.push( {text: $(this).text(), href: $(this).children('a').attr('href')} );
            });

            json.author = $('.doc_title h1').text();
          
    } else {
      res.sendStatus(500);
    }


    res.format({
      json: function () {
            res.status(200).send(json);
      },
      html: function () {
            res.render('showAuthor', {json: json});
      }
    });
  });
});

router.get('/browse/alphabetical', function (req, res, next) {
  var url = 'http://gospelink.com/browse/alphabetical?sort=' + req.query.sort;

  j.setCookie(cookie, url);

  request({url: url, jar: j}, function(error, response, html){
    if(!error) {
      var $ = cheerio.load(html);

            var json = { 
              books: [],
              alphaLinks: []
            };

            $('#main > div > a').each(function (index) {
              json.alphaLinks.push( {text: $(this).text(), href: $(this).attr('href')} );
            });

            $('#main .browse_content li').each(function (index) {
              json.books.push( {text: $(this).text(), href: $(this).children('a').attr('href')} );
            })
          
    } else {
      res.sendStatus(500);
    }


    res.format({
      json: function () {
            res.status(200).send(json);
      },
      html: function () {
            res.render('browseByTitle', {json: json});
      }
    });
  });
});

router.get('/browse/topics', function (req, res, next) {
  var url = 'http://gospelink.com/browse/topics?sort=' + req.query.sort;

  j.setCookie(cookie, url);

  request({url: url, jar: j}, function(error, response, html){
    if(!error) {
      var $ = cheerio.load(html);

            var json = { 
              books: [],
              alphaLinks: []
            };

            $('#main > div > a').each(function (index) {
              json.alphaLinks.push( {text: $(this).text(), href: $(this).attr('href')} );
            });

            $('#main .browse_content li').each(function (index) {
              json.books.push( {text: $(this).text(), href: $(this).children('a').attr('href')} );
            })
          
    } else {
      res.sendStatus(500);
    }


    res.format({
      json: function () {
            res.status(200).send(json);
      },
      html: function () {
            res.render('browseByTopic', {json: json});
      }
    });
  });
});

router.get('/browse/topic/:topic', function (req, res, next) {
  var url = 'http://gospelink.com/browse/topic/' + req.params.topic;

  j.setCookie(cookie, url);

  request({url: url, jar: j}, function(error, response, html){
    if(!error) {
      var $ = cheerio.load(html);

            var json = { 
              books: [],
              topicTitle: ""
            };

            $('#main .browse_content li').each(function (index) {
              json.books.push( {text: $(this).text(), href: $(this).children('a').attr('href')} );
            });

            json.topicTitle = $('.doc_title h1').text();
          
    } else {
      res.sendStatus(500);
    }


    res.format({
      json: function () {
            res.status(200).send(json);
      },
      html: function () {
            res.render('showTopic', {json: json});
      }
    });
  });
});


module.exports = router;
