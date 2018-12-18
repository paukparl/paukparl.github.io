#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;


float rand(float co){
    return fract(sin(co) * 43758.5453);
}

float noise(in float x) {
  float i = floor(x);  // integer
  float f = fract(x);  // fraction
  float y = rand(i); // built-in function
  y = mix(rand(i), rand(i + 1.0), f);
  y = mix(rand(i), rand(i + 1.0), smoothstep(0.,1.,f));
  return y;
}

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
  // d = length( abs(st)-vec2(.5, .5) );
  // d = length( min(abs(st)-.3,0.) );
  d = length( max(abs(st)-(.3+noise(u_time*10.)*.5),0.) );

  gl_FragColor = vec4(fract(vec3(d)*(noise(u_time*9.)*4.)) ,1.0);
}

