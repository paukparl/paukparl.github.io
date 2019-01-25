'use strict';

const canvas = document.getElementById("c");
const gl = canvas.getContext("webgl");
if (!gl) {
  console.log('NO WEBGL?!');
}

let mouseX=0,
    mouseY=0;
let firstSet = false;


let fragmentShaderSource = document.getElementById('fragment-shader').text;
let vertexShaderSource = document.getElementById('vertex-shader').text;

console.log(vertexShaderSource);

let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

let program = createProgram(gl, vertexShader, fragmentShader);




gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

const positions = [
  -1, -1,
    1,  1,
  -1,  1,
    1,  1,
    1, -1,
  -1, -1,
];

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

let positionAttributeLocation = gl.getAttribLocation(program, "a_position");




// Update global variables mouseX and mouseY upon mouse move,
// so they can later be used by our fragment shader as u_mouse uniforms.



(function loop(timeStamp) {

  const d = new Date();
  console.log(d.getTime());

  resizeCanvasToDisplaySize(gl, firstSet); // add custom ratio for performance (e.g. 1 or 0.7)

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);

  gl.enableVertexAttribArray(positionAttributeLocation);


  const size = 2;          // 2 components per iteration
  const type = gl.FLOAT;   // the data is 32bit floats
  const normalize = false; // don't normalize the data
  const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionAttributeLocation, 
    2,        // size
    gl.FLOAT, // type
    false,    // normalize
    0,        // stride
    0         // offset
  );

  const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
  const timeUniformLocation = gl.getUniformLocation(program, "u_time");
  gl.uniform1f(timeUniformLocation, timeStamp/1000.0);
  const mouseUniformLocation = gl.getUniformLocation(program, "u_mouse");
  gl.uniform2f(mouseUniformLocation, mouseX/canvas.width, 1-mouseY/canvas.height);

  gl.drawArrays(
    gl.TRIANGLES, // primitive type
    0,            // offset
    3             // count
  );

  window.requestAnimationFrame(loop);
}());