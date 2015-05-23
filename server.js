var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var host = 'http://localhost:3000';

var j = request.jar();
var cookie = request.cookie('auth_token=9f5e87096b404759462cdcc288db1f3561a447e3');

app.use(express.static(__dirname + '/client'));

app.get('/library/document/:doc', function(req, res){

	res.format({
		json: function () {
			var url = 'http://gospelink.com/library/document/' + req.params.doc;

			j.setCookie(cookie, url);

		    request({url: url, jar: j}, function(error, response, html){

		        if(!error){
		            var $ = cheerio.load(html);

		            var json = { 
		            	browseByTitle: host + '/browse/alphabetical?sort=A',
		            	browseByAuthor: host + '/browse/authors?sort=A',
		            	browseByTopic: host + '/browse/topics?sort=A',
		            	prev: "",
		            	next: "",
		            	chapterTitle: "",
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

		            if ($('.nav_chapter .left a').attr('href') != undefined) {
			            json.prev = host + $('.nav_chapter .left a').attr('href');
		            };
		            if ($('.nav_chapter .right a').attr('href') != undefined) {
			            json.next = host + $('.nav_chapter .right a').attr('href');
		            };

				    res.status(200).send(json);
		        } else {
				    res.sendStatus(500);
		        }
		    });
		},
		html: function () {
			res.sendFile(__dirname + '/client/index.html');
		}
	})

});

app.get('/library/contents/:doc', function (req, res) {
	var url = 'http://gospelink.com/library/contents/' + req.params.doc;

	j.setCookie(cookie, url);

	request({url: url, jar: j}, function(error, response, html){
		if(!error) {
			var $ = cheerio.load(html);

            var json = { 
            	browseByTitle: host + '/browse/alphabetical?sort=A',
            	browseByAuthor: host + '/browse/authors?sort=A',
            	browseByTopic: host + '/browse/topics?sort=A',
            	title: '',
            	author: '',
            	copyright: '',
            	toc: []
            };

            json.title = $('.book_title h1').text();
            json.author = $('.book_title h2').text();
            json.copyright = $('.copyright').text();

            $('.sidebar_inner .container li').each(function (index) {
            	var re = /library\/sell\/(\d*)\'/;
            	var chapter = '';
            	var str = $(this).children('a').attr('onclick');
          		if (str !== undefined) {
	            	chapter = '/library/document/' + str.match(re, '$1')[1];
	            } else {
	            	chapter = $(this).children('a').attr('href');
	            };
            	json.toc.push( {text: $(this).text(), href: host + chapter} );
            });

        	res.status(200).send(json);

		} else {
			res.sendStatus(500);
		}
	});
});

app.get('/browse/alphabetical', function (req, res) {
	var url = 'http://gospelink.com/browse/alphabetical?sort=' + req.query.sort;

	j.setCookie(cookie, url);

	request({url: url, jar: j}, function(error, response, html){
		if(!error) {
			var $ = cheerio.load(html);

            var json = { 
            	browseByTitle: host + '/browse/alphabetical?sort=A',
            	browseByAuthor: host + '/browse/authors?sort=A',
            	browseByTopic: host + '/browse/topics?sort=A',
            	books: [],
            	alphaLinks: []
            };

            $('#main > div > a').each(function (index) {
            	json.alphaLinks.push( {text: $(this).text(), href: host + $(this).attr('href')} );
            });

            $('#main .browse_content li').each(function (index) {
            	json.books.push( {text: $(this).text(), href: host + $(this).children('a').attr('href')} );
            })
        	
        	res.status(200).send(json);

		} else {
			res.sendStatus(500);
		}
	});
});

app.get('/browse/topics', function (req, res) {
	var url = 'http://gospelink.com/browse/topics?sort=' + req.query.sort;

	j.setCookie(cookie, url);

	request({url: url, jar: j}, function(error, response, html){
		if(!error) {
			var $ = cheerio.load(html);

            var json = { 
            	browseByTitle: host + '/browse/alphabetical?sort=A',
            	browseByAuthor: host + '/browse/authors?sort=A',
            	browseByTopic: host + '/browse/topics?sort=A',
            	books: [],
            	alphaLinks: []
            };

            $('#main > div > a').each(function (index) {
            	json.alphaLinks.push( {text: $(this).text(), href: host + $(this).attr('href')} );
            });

            $('#main .browse_content li').each(function (index) {
            	json.books.push( {text: $(this).text(), href: host + $(this).children('a').attr('href')} );
            })
        	
        	res.status(200).send(json);

		} else {
			res.sendStatus(500);
		}
	});
});

app.get('/browse/topic/:topic', function (req, res) {
	var url = 'http://gospelink.com/browse/topic/' + req.params.topic;

	j.setCookie(cookie, url);

	request({url: url, jar: j}, function(error, response, html){
		if(!error) {
			var $ = cheerio.load(html);

            var json = { 
            	browseByTitle: host + '/browse/alphabetical?sort=A',
            	browseByAuthor: host + '/browse/authors?sort=A',
            	browseByTopic: host + '/browse/topics?sort=A',
            	topics: []
            };

            $('#main .browse_content li').each(function (index) {
            	json.topics.push( {text: $(this).text(), href: host + $(this).children('a').attr('href')} );
            })
        	
        	res.status(200).send(json);

		} else {
			res.sendStatus(500);
		}
	});
});

app.get('/browse/authors', function (req, res) {
	var url = 'http://gospelink.com/browse/authors?sort=' + req.query.sort;

	j.setCookie(cookie, url);

	request({url: url, jar: j}, function(error, response, html){
		if(!error) {
			var $ = cheerio.load(html);

            var json = { 
            	browseByTitle: host + '/browse/alphabetical?sort=A',
            	browseByAuthor: host + '/browse/authors?sort=A',
            	browseByTopic: host + '/browse/topics?sort=A',
            	authors: [],
            	alphaLinks: []
            };

            $('#main > div > a').each(function (index) {
            	json.alphaLinks.push( {text: $(this).text(), href: host + $(this).attr('href')} );
            });

            $('#main .browse_content li').each(function (index) {
            	json.authors.push( {text: $(this).text(), href: host + $(this).children('a').attr('href')} );
            })
        	
        	res.status(200).send(json);

		} else {
			res.sendStatus(500);
		}
	});
});

app.get('/browse/author/:author', function (req, res) {
	var url = 'http://gospelink.com/browse/author/' + req.params.author;

	j.setCookie(cookie, url);

	request({url: url, jar: j}, function(error, response, html){
		if(!error) {
			var $ = cheerio.load(html);

            var json = { 
            	browseByTitle: host + '/browse/alphabetical?sort=A',
            	browseByAuthor: host + '/browse/authors?sort=A',
            	browseByTopic: host + '/browse/topics?sort=A',
            	authors: [],
            	alphaLinks: []
            };

            $('#main > div > a').each(function (index) {
            	json.alphaLinks.push( {text: $(this).text(), href: host + $(this).attr('href')} );
            });

            $('#main .browse_content li').each(function (index) {
            	json.authors.push( {text: $(this).text(), href: host + $(this).children('a').attr('href')} );
            })
        	
        	res.status(200).send(json);

		} else {
			res.sendStatus(500);
		}
	});
});

app.listen('3000')

console.log('Listening on 3000');

exports = module.exports = app;