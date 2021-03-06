let copyVideo = false;
let canvas; 
let gl;
const video = document.getElementById('video');
let videoWidth, videoHeight;




let mouseX, mouseY; mouseX=mouseY=0;
let alpha=0, beta=0, gamma=0;
let eulerAngle = {};
let camera, controls;

// Update global variables mouseX and mouseY upon mouse move,
// so they can later be used by our fragment shader as u_mouse uniforms.
document.addEventListener('mousemove', mousemoveHandler);
function mousemoveHandler(e) {
  e = e || window.event;
  mouseX = e.pageX * window.devicePixelRatio;
  mouseY = e.pageY * window.devicePixelRatio;
}


function makeRequest (method, url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    xhr.send();
  });
}

// First, async load the vertex shader.
function start() {
  console.log('clicked')
  canvas= document.createElement("CANVAS");
  document.body.appendChild(canvas);
  canvas.style.zIndex = 3;
  gl = canvas.getContext("webgl");
  if (!gl) {
    console.log('NO WEBGL?!')
  }

  // fullScreen();

makeRequest('GET', 'vertexShader.glsl')
.then(function (data) {

  // When resolved, save the vertex shader in the global variable.
  vertexShaderSource = data;

  // Then, async load the fragment shader.
//   return makeRequest('GET', '/fragmentShaders/ray_marching/01.glsl');
  return makeRequest('GET', 'fragmentShaders/02.glsl');
})
.then(function (data) {
  // When resolved, save the fragment shader in the global variable.
  fragmentShaderSource = data;
  loadVideo();
  
  
}) // If there is error in loading above files.
.catch(function (err) {
  console.error('error!', err.statusText);
});
}

function loadVideo() {
  
  // ------------ PHONE DEV
  navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode:  "environment"  } })
  .then(function(stream) {
    console.log(stream.getVideoTracks())
    video.srcObject = stream;
    video.play();
    
    video.addEventListener('playing', function() {
      playing = true;
      videoWidth = video.videoWidth;
      videoHeight = video.videoHeight;
  // ------------ PHONE DEV
      setCamera();
      
      main();
  // ------------ PHONE DEV
      if (playing && timeupdate) {
        copyVideo = true;
      }
      
   }, true);
 
   video.addEventListener('timeupdate', function() {
      timeupdate = true;
      if (playing && timeupdate) {
        copyVideo = true;        
      }
   }, true);
  })
  .catch(function(err) {
    console.log("An error occurred! " + err);
  });
  // ------------ PHONE DEV
}


function setCamera() {
  // controls = new THREE.DeviceOrientationControls( camera );
  // controls.connect();
  // camera.quaternion = THREE.Quaternion();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );
  controls = new THREE.DeviceOrientationControls( camera );
}


function fullScreen() {
  // var prom1;
  // canvas.requestFullscreen();
  if (canvas.requestFullscreen) {
    canvas.requestFullscreen();
  } else if (canvas.mozRequestFullScreen) { /* Firefox */
    canvas.mozRequestFullScreen();
  } else if (canvas.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
    console.log(canvas.requestFullscreen);
    canvas.webkitRequestFullscreen();
  } else if (canvas.msRequestFullscreen) { /* IE/Edge */
    canvas.msRequestFullscreen();
  }
}



function main() {
  
  
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  createProgram(gl, vertexShader, fragmentShader);


  resizeCanvasToDisplaySize(gl.canvas);




  positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  positionBuffer = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
  // let stretchFactor = canvas.width/canvas.height - video.videoWidth/video.videoHeight;

  let canvasRatio = canvas.width/canvas.height;

  // ------------ PHONE DEV
  let videoRatio = video.videoWidth/video.videoHeight;
  // let videoRatio = 3/4
  // ------------ PHONE DEV



  if (canvasRatio < videoRatio) {
    var stretch = (videoRatio-canvasRatio)/2/canvasRatio;
    console.log(stretch*2 + canvasRatio + '   ' + videoRatio);
    var positions = [
      0-stretch, 0,
      1+stretch, 0,
      0-stretch, 1,
      1+stretch, 0,
      0-stretch, 1,
      1+stretch, 1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  } else {
    var stretch = (canvasRatio-videoRatio)/2/videoRatio;
    console.log(stretch*2 + canvasRatio + '   ' + videoRatio);
    var positions = [
      0, 0-stretch,
      1, 0-stretch,
      0, 1+stretch,
      1, 0-stretch,
      0, 1+stretch,
      1, 1+stretch,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  }


  texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");
  texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  // IF CAMERA FRONT-FACING
  var positions = [
    0.0, 1.0,
    1.0, 1.0,
    0.0, 0.0,
    1.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
      
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);



  texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([0, 0, 255, 255]));

                
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);         
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  
  // Asynchronously load an image
  // var image = new Image();
  // image.src = "tex.png";
  // image.addEventListener('load', function() {
  //   gl.bindTexture(gl.TEXTURE_2D, texture);
  //   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
  //   gl.generateMipmap(gl.TEXTURE_2D);
  // });

  requestAnimationFrame(drawScene);

  function drawScene(timeStamp) {
    resizeCanvasToDisplaySize(gl.canvas);

    controls.update();
    eulerAngle = toEuler(camera.quaternion);
    console.log(eulerAngle['a'].toFixed(2)+ '   ' + eulerAngle['b'].toFixed(2) + '   ' + eulerAngle['g'].toFixed(2) );

    // document.getElementById('alpha').innerHTML = eulerAngle['a'].toFixed(2);
    // document.getElementById('beta').innerHTML = eulerAngle['b'].toFixed(2);
    // document.getElementById('gamma').innerHTML = eulerAngle['g'].toFixed(2);
    

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);
      
    // Look up uniform locations
    resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    timeUniformLocation = gl.getUniformLocation(program, "u_time");
    mouseUniformLocation = gl.getUniformLocation(program, "u_mouse");
    textureUniformLocation = gl.getUniformLocation(program, "u_texture");
    aUniformLocation = gl.getUniformLocation(program, "u_a");
    bUniformLocation = gl.getUniformLocation(program, "u_b");
    gUniformLocation = gl.getUniformLocation(program, "u_g");

    // Set time uniform
    gl.uniform1f(timeUniformLocation, timeStamp/1000.0);
    // Set mouse uniform
    gl.uniform2f(mouseUniformLocation, mouseX/canvas.width, 1-mouseY/canvas.height);
    // Set the resolution
    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);

    gl.uniform1i(textureUniformLocation, 0);

    // gl.uniform1f(aUniformLocation, eulerAngle['w']);
    // gl.uniform1f(bUniformLocation, eulerAngle['x']);
    // gl.uniform1f(gUniformLocation, eulerAngle['y']);
    gl.uniform1f(aUniformLocation, eulerAngle['a']);
    gl.uniform1f(bUniformLocation, eulerAngle['b']);
    gl.uniform1f(gUniformLocation, eulerAngle['g']);


    // document.getElementById('mouseX').innerHTML = mouseX;

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enableVertexAttribArray(positionAttributeLocation);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);
    
    


    // // Turn on the teccord attribute
    gl.enableVertexAttribArray(texcoordAttributeLocation);
    // // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
      texcoordAttributeLocation, size, type, normalize, stride, offset);

    if (copyVideo) {
      const level = 0;
      const internalFormat = gl.RGBA;
      const srcFormat = gl.RGBA;
      const srcType = gl.UNSIGNED_BYTE;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    srcFormat, srcType, video);
    }



      
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);



    window.requestAnimationFrame(drawScene);
  }

}




function toEuler(quat) 
  {
    var test = quat['x']*quat['y'] + quat['z']*quat['w'];
    if (test > 0.499) {
      var euler = {};
      euler['a'] = 2 * Math.atan2(quat['x'], quat['w']);
      euler['g'] = Math.PI/2; // g and b have to be inversed here and below idk why
      euler['b'] = 0;
      return euler;
    }
    if (test < -0.499) {
      var euler = {};
      euler['a'] = -2 * Math.atan2(quat['x'], quat['w'])
      euler['g'] = -Math.PI/2;
      euler['b'] = 0;
      return euler;
    }
    var euler = {};
    var sqx = quat['x']*quat['x'];
    var sqy = quat['y']*quat['y'];
    var sqz = quat['z']*quat['z'];
    euler['a'] = Math.atan2(2*quat['y']*quat['w']-2*quat['x']*quat['z'], 1-2*sqy-2*sqz);
    euler['g'] = Math.asin(2*test);
    euler['b'] = Math.atan2(2*quat['x']*quat['w']-2*quat['y']*quat['z'], 1-2*sqx-2*sqz);
    return euler;
  }




function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2,
  ]), gl.STATIC_DRAW);
}

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  // If compile succeeded, return shader
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  // If failed, console.log the problem and delete shader
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  // If link succeeded, return
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return;
  }

  // If failed, console.log the problem and delete program
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function resizeCanvasToDisplaySize(canvas) {
  // console.log(canvas.width + "  " + canvas.height);
  // Get real-CSS pixel ratio in case of Retina display
  var realToCSSPixels = 0.4;
  var displayWidth  = Math.floor(canvas.clientWidth * realToCSSPixels);
  var displayHeight = Math.floor(canvas.clientHeight * realToCSSPixels);
  
  if (canvas.width !== displayWidth ||
      canvas.height !== displayHeight) {
    
    canvas.width  = displayWidth;
    canvas.height = displayHeight;

    // Clip space is converted to screen space.
    // x:  (-1, 1)  -->  (0, canvas.width)
    // y:  (-1, 1)  -->  (0, canvas.height)
    gl.viewport(0, 0, canvas.width, canvas.height);
    return true;
  }
  return false;
}
