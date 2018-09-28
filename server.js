console.log('server is starting');

var express = require('express');
var fs = require('fs');

var app = express();

var server = app.listen(3000);

app.use(express.static('public'));


app.get('/lol', getEmojis);

function getEmojis(request, response) {
  // response.set('Content-Type', 'text/html');
  console.log('FUCK');
  readEmojis('public/src/emojis.txt')
  response.send(emojiList);
  
}




var readEmojis = function(path) {
  var emojiString = fs.readFileSync(path, 'utf8');
  emojiList = emojiString.split(' ');
  console.log('**********************'+emojiList.length);
}