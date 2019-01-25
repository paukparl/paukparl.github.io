'use strict';

const createShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  // If compile succeeded, return shader
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  // If failed, console.log the problem and delete shader
  console.log(shader);
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
};


const createProgram = (gl, vertexShader, fragmentShader) => {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  // If link succeeded, return
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  // If failed, console.log the problem and delete program
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
};

const resizeCanvasToDisplaySize = (gl, customRatio) => {
  
  // get real-CSS pixel ratio or custom ratio if there is one
  const realToCSSPixels = customRatio || window.devicePixelRatio;
  const displayWidth  = Math.floor(gl.canvas.clientWidth * realToCSSPixels);
  const displayHeight = Math.floor(gl.canvas.clientHeight * realToCSSPixels);
  
  // if there is change
  if (gl.canvas.width !== displayWidth ||
      gl.canvas.height !== displayHeight) {
    gl.canvas.width  = displayWidth;
    gl.canvas.height = displayHeight;

    // Clip space is converted to screen space.
    // x:  (-1, 1)  -->  (0, canvas.width)
    // y:  (-1, 1)  -->  (0, canvas.height)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // return true;
  }
  // return false;
};

module.exports = {
  createShader,
  createProgram,
  resizeCanvasToDisplaySize
}