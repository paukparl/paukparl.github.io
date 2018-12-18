/*    
    1. SOME PREPARATIONS
    Before the actual WebGL, here are some preparations.
*/

// Get WebGL context.
// A context is basically an object that holds all of WebGL.
const canvas = document.getElementById("c");
const gl = canvas.getContext("webgl");
if (!gl) {
  console.log('NO WEBGL?!')
}

// Some global variables
let vertexShaderSource, fragmentShaderSource;
let program, positionAttributeLocation;
let resolutionUniformLocation, timeUniformLocation, mouseUniformLocation;
let mouseX, mouseY; mouseX=mouseY=0;
let mouseInX, mouseInY; mouseInX=mouseInY=0;

// Update global variables mouseX and mouseY upon mouse move,
// so they can later be used by our fragment shader as u_mouse uniforms.
document.addEventListener('mousemove', mousemoveHandler);
function mousemoveHandler(e) {
  e = e || window.event;
  mouseX = e.pageX; // *realToCSSPixels deleted for performance
  mouseY = e.pageY; // *realToCSSPixels deleted for performance

  
}



/*    
    2. ASYNC LOAD SHADERS

    Here, makeRequest() is the function that asynchronously loads a local file.
    We will use it to load vertex and fragment shaders from separate files.

    I really prefer separate files for shaders to having them as strings in this file or index.html,
    because you can then highlight the shaders by installing extensions to your editor.
    (If you use VS Code, just go to extensions and search up 'GLSL')
    I find that such highlighting is quite helpful to a beginner like me.

    Also, this way, you can keep a collection of fragment shaders inside a directory,
    (in this case, I used "/fragmentShaders/") and keep track of your progress.
*/


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
makeRequest('GET', '/vertexShader.glsl')
.then(function (data) {

  // When resolved, save the vertex shader in the global variable.
  vertexShaderSource = data;

  // Then, async load the fragment shader.
//   return makeRequest('GET', '/fragmentShaders/ray_marching/01.glsl');
  return makeRequest('GET', '/fragmentShaders/ray_marching/02.glsl');
})
.then(function (data) {
  // When resolved, save the fragment shader in the global variable.
  fragmentShaderSource = data;


  /*    
      3. START THE PIPELINE!
      Here is actually where everything starts to happen.
      There are just two functions here: setup() and renderLoop().
      I put everything in these two functions, so it'd all fit in this async callback.
  */


  // setup() is only called once at the beginning.
  setup();

  // renderLoop() is called over and over.
  renderLoop();

}) // If there is error in loading above files.
.catch(function (err) {
  console.error('error!', err.statusText);
});






/*    
    A. SETUP AND LOOP DEFINED
    Here, you start to see the functions that make up setup() and renderLoop().
*/


function setup() {

  // Create vertex & fragment shaders from the source files.
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  // Create a program with the shaders, and save it to a global variable.
  // A program is basically just a couple of shaders combined.
  createProgram(gl, vertexShader, fragmentShader);

  // Set buffers for the vertex shader.
  setBuffer();
}


function renderLoop(timeStamp) {
  var d = new Date();
  console.log(d.getTime());
  // Resize canvas if display size changes
  resizeCanvasToDisplaySize(gl.canvas);

  // Set uniforms, one of which is u_time that increments with each frame (timeStamp).
  setUniforms(timeStamp);

  // Where WebGL finally draws based on predefined attribute and buffer.
  draw();
  
  // requestAnimationFrame() is a special js function taking care of refreshing animations.
  // So renderLoop() loops recursively.
  window.requestAnimationFrame(renderLoop);
}




/*    
    B. MORE FUNCTIONS DEFINED
    Here, you can take a look at what each function does.
    Most of these functions are modified from greggman's tutorial and webgl-utils.js file.
    I wish I could do a better job explaining the details than webglfundamentals.org, but I really can't.
    If you want to understand each and every function of WebGL better, 
    read the first chapter of https://webglfundamentals.org/
*/


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


function setBuffer() {

  // First, create a buffer.
  var positionBuffer = gl.createBuffer();

  // gl.ARRAY_BUFFER is a global bind point (kind of like an internal global variable inside WebGL.)
  // After you bind a resource to the bind point, other functions can refer to it through the bind point.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Each pair of number designates a point in clip space that spans between -1 and 1 for both x and y axes.
  // These numbers are later used to draw 2 triangles.
  // The 2 triangles form a rectangle that fills the canvas.
  var positions = [
    -1, -1,
     1,  1,
    -1,  1,
     1,  1,
     1, -1,
    -1, -1,
  ];
  // gl.STATIC_DRAW tells WebGL we are not likely to change this data much.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  positionAttributeLocation = gl.getAttribLocation(program, "a_position");
}


function resizeCanvasToDisplaySize(canvas) {
  
  // Get real-CSS pixel ratio in case of Retina display
  var realToCSSPixels = window.devicePixelRatio; 
  var displayWidth  = Math.floor(canvas.clientWidth); // *realToCSSPixels deleted for performance
  var displayHeight = Math.floor(canvas.clientHeight); // *realToCSSPixels deleted for performance
  
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


function setUniforms(timeStamp) {

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);
    
  // Look up uniform locations
  resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  timeUniformLocation = gl.getUniformLocation(program, "u_time");
  mouseUniformLocation = gl.getUniformLocation(program, "u_mouse");


  mouseInX += (mouseX - mouseInX)*0.05;
  mouseInY += (mouseY - mouseInY)*0.05;

  // mouseLastX = mouseX;
  // mouseLastY = mouseY;

  // Set time uniform
  gl.uniform1f(timeUniformLocation, timeStamp/1000.0);
  // Set mouse uniform
  gl.uniform2f(mouseUniformLocation, mouseInX/canvas.width, 1-mouseInY/canvas.height);
  // Set the resolution
  gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);

  gl.enableVertexAttribArray(positionAttributeLocation);
}


function draw() {
  
  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset);
  
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  gl.drawArrays(primitiveType, offset, count);
}
