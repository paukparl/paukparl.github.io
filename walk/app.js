'use strict';

const renderer = require('./renderer.js');

const express = require('express');
const hbs = require('hbs');

const port = process.env.PORT || 3000;
const app = express();

// questionable... should shaders file be here..?
app.use(express.static(__dirname + '/public'));




app.get('/', (req, res) => {
  res.render('home.hbs', {
    pageTitle: 'Home',
    welcomeMessage: 'Welcome to my node test website!'
  })
});





app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});




let date;

const renderLoop = () => {
  date = new Date();
  console.log(date.getTime());
  timeStamp = date.getTime();
  document.getElementById('time').innerHTML = `UTC ${timeStamp}`;



  // // Resize canvas if display size changes
  // resizeCanvasToDisplaySize(gl.canvas);

  // // Set uniforms, one of which is u_time that increments with each frame (timeStamp).
  // setUniforms(timeStamp);

  // // Where WebGL finally draws based on predefined attribute and buffer.
  // draw();



  
  
  window.requestAnimationFrame(renderLoop);
}

renderLoop();