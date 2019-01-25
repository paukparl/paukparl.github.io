#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265358979323846
#define SPEED 0.5 // (0. <> 1.)
#define NUM_BALLS 4

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;


struct Ball{
  vec3 pos;
  float r;
  vec3 col;
};


float opSmoothUnion( float d1, float d2, float k ) {
  float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
  return mix( d2, d1, h ) - k*h*(1.0-h); 
}

float sdSphere( vec3 p, vec3 origin, float radius ) {
  // vec3 sphereOrigin = vec3(sin(u_time*4.)*1., 0., 0.);
  return length(p-origin)-radius;
}

float rand(float co){
  return fract(sin(co) * 43758.5453);
}

float map(vec3 p, Ball Balls[NUM_BALLS]) {
  // p.x=mod(p.x,2.)-1.;
  // p.y=mod(p.y,2.)-1.;
  // p.z=mod(p.z,5.0)-5.0;

  float d;

  for (int i = 0; i < NUM_BALLS; i++) {
    float sphere = sdSphere(
                          p, 
                          Balls[i].pos,
                          Balls[i].r);
    if (i == 0) d = sphere;
    else d = opSmoothUnion ( d, sphere, 0.3);
  }
  return d;
}


float trace(vec3 origin, vec3 direction, Ball Balls[NUM_BALLS]) {
  
  float rayLength = 0.;
  vec3 currentPoint = origin;

  for (int i=0; i<32; i++) {
    currentPoint = origin + direction * rayLength;
    float increment = map(currentPoint, Balls);
    rayLength += increment;

    // 
    if (increment < 0.0001) {
      break;
    } 

    if (rayLength > 1000.0) { 
      // rayLength = 0.;
      break;
    }
  }
  return rayLength;
}


mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}


vec2 unstretch( in vec2 resolution, in vec2 st ) {
  if (resolution.x > resolution.y) st.x *= resolution.x/resolution.y;
  else st.y *= resolution.y/resolution.x;
  return st;
}


void main() {

  float time = u_time * 0.8;

  Ball Balls[NUM_BALLS];

  for (int i = 0; i < NUM_BALLS; i++) {
    float randOff = rand(float(i));
    Balls[i].r = 0.8;
    Balls[i].pos = vec3(
      cos((time*(1.+randOff) + float(i)) * (2.+randOff) * SPEED),
      sin((time*(1.+randOff) + float(i)) * (2.) * SPEED),
      sin((time*(1.+randOff) + float(i)) * (2.5) * SPEED)
    );
  }
  Balls[0].col = vec3(1., 0., 0.);
  Balls[1].col = vec3(1., 1., 0.);
  Balls[2].col = vec3(1., 0., 1.);
  Balls[3].col = vec3(0., 1., 1.);

  vec2 st = gl_FragCoord.xy/u_resolution.xy;
  st = st * 2. - 1.;
  st = unstretch(u_resolution, st);
  // st = abs(st);

  vec3 camPos = vec3(0., 0., -4.);

  vec3 rayDir = normalize(vec3(st, 1.));

  float rayLength = trace(camPos, rayDir, Balls);

  vec3 pos = rayDir * rayLength;







  vec3 color = vec3( 1. / (1. + rayLength * rayLength * 0.05), pos.x, pos.y);

  gl_FragColor = vec4(color, 1.0);
}