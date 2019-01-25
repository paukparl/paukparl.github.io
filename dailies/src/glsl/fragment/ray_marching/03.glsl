#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265358979323846

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;


float sphere( vec3 p, float radius ) {
  // vec3 sphereOrigin = vec3(sin(u_time*4.)*1., 0., 0.);
  vec3 sphereOrigin = vec3(0., 0., 0.);
  return length(p-sphereOrigin)-radius;
}

float map(vec3 p) {
  p.x=mod(p.x,2.)-1.;
  p.y=mod(p.y,2.)-1.;
  p.z=mod(p.z,5.0)-5.0;
  return sphere(p, 1.0);
}

vec3 trace(vec3 origin, vec3 direction) {
  
  float rayLength = 0.;
  vec3 currentPoint = origin;

  for (int i=0; i<30; i++) {
    currentPoint = origin + direction * rayLength;
    float increment = map(currentPoint);
    rayLength += increment;
    if (increment < 0.001) {
      return vec3(1., abs(sin(u_time)), 0.);
    } 

    if (rayLength > 10000.0) { 
      return vec3(0.2);
    }
    
    if (i == 29) {
      return vec3(1., 0., 1.-abs(sin(u_time)));
    }

  }

  // return 0.;

  // return;
}


mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}


void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  st = st * 2. - 1.;
  st.x *= u_resolution.x/u_resolution.y;

  vec3 cameraPosition = vec3(0., 0.+ u_time, 8.);
  

  vec3 rayDirection = normalize(vec3(st.x, st.y, 0.2));
  rayDirection.yz *= rotate2d(4.*u_mouse.y);

  vec3 color = vec3(0., 0., 0.3);
  color += trace(cameraPosition, rayDirection);


  gl_FragColor = vec4(color, 1.0);
}