'use strict';

(async () => {

const CUSTOM_RATIO = null;

const canvas = document.getElementById("c");
const gl = canvas.getContext("webgl");
if (!gl) {
  console.log('NO WEBGL?!');
}

let mouseX=0.5,
    mouseY=0.5;

canvas.addEventListener('mousemove', (e) => {
  const realToCSSPixels = CUSTOM_RATIO || window.devicePixelRatio;
  e = e || window.event;
  mouseX = e.pageX * realToCSSPixels;
  mouseY = e.pageY * realToCSSPixels;
});


let fragmentShaderSource = await makeRequest('GET', 'fragment.glsl');
let vertexShaderSource = await makeRequest('GET', 'vertex.glsl');


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



(function loop (timeStamp) {

  const d = new Date();
  // console.log(d.getTime());

  resizeCanvasToDisplaySize(gl, CUSTOM_RATIO); // add custom ratio for performance (e.g. 1 or 0.7)

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);

  gl.enableVertexAttribArray(positionAttributeLocation);

  gl.vertexAttribPointer(
    positionAttributeLocation, 
    2,        // size // 2 components per iteration
    gl.FLOAT, // type // the data is 32bit floats
    false,    // normalize // don't normalize the data
    0,        // stride // 0 = move forward size * sizeof(type) each iteration to get the next position
    0         // offset // start at the beginning of the buffer
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
    6             // count
  );

  window.requestAnimationFrame(loop);
})();


})();