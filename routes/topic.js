var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');
var db = require('../lib/db');

router.get('/create', function(req, res){
db.query('SELECT * FROM topic', function(error, topics){
  var title = 'WEB - create';
  var list = template.list(topics);
  var html = template.HTML(title, list, `
    <form action="/topic/create_process" method="post">
      <p><input type="text" name="title" placeholder="title"></p>
      <p>
        <textarea name="description" placeholder="description"></textarea>
      </p>
      <p>
        <input type="submit">
      </p>
    </form>
  `, '');
  res.send(html);
  });
});
  
router.post('/create_process', function(req, res){
  var post = req.body;
  db.query('INSERT INTO topic (title, description, created, author_id) VALUES(?, ?, now(), 1)', [post.title, post.description], function(error, topic){
    res.redirect(`/topic/${topic.insertId}`);
  });
});
  
  router.get('/update/:pageId', function(req, res){
    db.query('SELECT * FROM topic', function(error1, topics){
      db.query(`SELECT * FROM topic WHERE id=?`, [req.params.pageId], function(error2, topic){
        var list = template.list(topics);
        var html = template.HTML(topic[0].title, list,
          `
          <form action="/topic/update_process" method="post">
            <input type="hidden" name="id" value="${topic[0].title}">
            <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
            <p>
              <textarea name="description" placeholder="description">${topic[0].description}</textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
          `,
          `<a href="/topic/create">create</a> <a href="/topic/update/${topic[0].id}">update</a>`
        );
        res.send(html);
      });
    });
  });

  router.post('/update_process', function(req, res){
    var post = req.body;
    db.query('UPDATE topic SET title=?, description=?, author_id=1 WHERE id=?', [post.title, post.description, post.id], function(error, result){
    res.redirect(`/topic/${result.insertId}`);
    });
  });
  
  router.post('/delete_process', function(req, res){
    var post = req.body;
    var id = post.id;
    var filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function(error){
      res.redirect('/');
    });
  });
  
  router.get('/:pageId/', function (req, res, next) {
    db.query('SELECT * FROM topic', function(error1, topics){
      db.query(`SELECT * FROM topic WHERE id=?`, [req.params.pageId], function(error2, topic){
        var title = topic[0].title;
        console.log(title);
        var sanitizedTitle = sanitizeHtml(title);
        var sanitizedDescription = sanitizeHtml(topic[0].description);
        var list = template.list(topics);
        var html = template.HTML(sanitizedTitle, list,
          `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
          ` <a href="/topic/create">create</a>
            <a href="/topic/update/${topic[0].id}">update</a>
            <form action="/topic/delete_process" method="post">
              <input type="hidden" name="id" value="${sanitizedTitle}">
              <input type="submit" value="delete">
            </form>`
          );
          res.send(html);
      });
    });
  });
  module.exports = router;