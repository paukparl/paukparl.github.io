#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;


void main(){
  float asp = u_resolution.x/u_resolution.y;
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  st.x *= asp;
  vec3 color = vec3(0.0);
  float d = 0.0;

  // Remap the space to -1. to 1.
  // st = st *2.-1.;
  st.x = st.x*2.-asp;
  st.y = st.y*2.-1.;
  
  // Make the distance field
  d = length( abs(st)-vec2(.5*asp, .5) );

  // accelerate u_time
  float pace = u_time*100.;
  gl_FragColor = vec4(vec3(fract(d*10.*pace), fract(d*2.1*pace), fract(d*5.9*pace)),0.9);
}
