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
  st.x += u_time*0.1;
  vec3 color = vec3(0, 0, 0);
  float d = 0.0;

  // Remap the space to -1. to 1.
  // st = st *2.-1.;

  // background
  color.r = sin(u_time*0.2)*0.1;
  color.b = cos(u_time*0.2)*0.1;

  // Make the distance field
  d = length( fract(abs(st))-vec2(0.5));

  color += vec3(smoothstep(0.15,0.4,d)* smoothstep(0.5,0.45,d) )*fract(d*169.*u_time);

  gl_FragColor = vec4( color,1.0 );
}
