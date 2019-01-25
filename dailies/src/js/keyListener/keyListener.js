'use strict';

import CCapture from 'ccapture';

const capturer = new CCapture( {
  format: 'webm',
  verbose: true
} );


const pressed = {};
const keys = [16, 13];
let triggered = false;
let capturing = false;

window.addEventListener('keydown', (e) => {
  //console.log(e.keyCode);
  pressed[e.keyCode] = true;
  if ((e.keyCode === keys[0] || e.keyCode === keys[1]) &&
      (pressed[keys[0]] && pressed[keys[1]])) {
    if (!triggered) {
      console.log('CAPTURE STATE CHANGE!!!');
      capturing = !capturing;
      if (capturing) capturer.start();
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

const capturer





// module.exports.