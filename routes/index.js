var express = require('express');
var router = express.Router();
var template = require('../lib/template');
var db = require('../lib/db');


router.get('/', function (req, res) {
db.query('SELECT * FROM topic', function(error, topics){
  var title = 'Welcome';
  var description = 'Hello, Node.js';
  var list = template.list(topics);
    var html = template.HTML(title, list,
      `<h2>${title}</h2>${description}
      <img src="/images/hello.jpg" style="width:300px; display:block; margin-top:10px;">`,
      `<a href="/topic/create">create</a>`
    );
    res.send(html);
  });
});
  module.exports = router;
  