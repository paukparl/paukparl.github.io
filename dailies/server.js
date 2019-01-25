'use strict';

const {findSync} = require('./findSync/findSync');

const fs = require('fs');

const express = require('express');

const app = express();


app.use(express.static(__dirname + '/dist'));

const dailies = fs.readdirSync(__dirname + '/dist/dailies')

app.get('/', (req, res) => {
  res.render('home.hbs', {dailies});
})

app.get('/dailies/:date/', function (req, res) {
  res.render('sketch.hbs', {
    date: req.params.date
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is up on port ${process.env.PORT||3000}`);
});