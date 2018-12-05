#ifdef GL_ES
precision mediump float;
#endif

attribute vec2 a_position;
attribute vec2 a_texcoord;

uniform vec2 u_resolution;

varying vec2 v_texcoord;

void main() {
  // vec2 zeroToOne = a_position / u_resolution;
 
  // convert from 0->1 to 0->2
  vec2 zeroToTwo = a_position * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace, 0, 1);
  // gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

  v_texcoord = a_texcoord;
}