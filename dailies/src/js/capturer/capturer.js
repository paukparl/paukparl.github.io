'use strict';

// import CCapture from 'ccapture.js';
require('ccapture.js');

let isCapturing = false;
let capturer;

const initiate = (keys, format, name) => {
  capturer = new CCapture( {
    format,
    verbose: true,
    name
  } );
  const pressed = {};
  let triggered = false;

  window.addEventListener('keydown', (e) => {
    pressed[e.keyCode] = true;
    if ((e.keyCode === keys[0] || e.keyCode === keys[1]) &&
        (pressed[keys[0]] && pressed[keys[1]])) {
      if (!triggered) {
        console.log('CAPTURE STATE CHANGE!!!');
        isCapturing = !isCapturing;
        if (isCapturing) capturer.start();
        else {
          capturer.stop();
          capturer.save();
        }
        triggered = true;
      }
    }
  });
  
  window.addEventListener('keyup', (e) => {
    pressed[e.keyCode] = false;
    if (e.keyCode === keys[0] || e.keyCode === keys[1]) {
      triggered = false;
    }
  });
};

const captureFrame = (canvas) => {
  if (isCapturing) {
    capturer.capture(canvas);
  }
}

module.exports = {
  initiate,
  captureFrame
}