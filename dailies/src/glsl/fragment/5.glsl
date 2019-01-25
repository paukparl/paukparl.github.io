#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define TWO_PI 6.28318530718

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// Reference to
// http://thndl.com/square-shaped-shaders.html

void main(){
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  st.x *= u_resolution.x/u_resolution.y;
  vec3 color = vec3(0.0);
  float d = 0.0;

  float asp = u_resolution.x/u_resolution.y;

  // Remap the space to -1. to 1.
  st = vec2(st.x*2.-asp, st.y*2.-1.);

  // Number of sides of your shape
  int N = 2;

  float a = atan(st.y, st.x);
  float pct = floor(sin(a*float(N))+.5);

  color = vec3(pct);

  gl_FragColor = vec4(color, 1.0);
}




/////// TOO HARD...