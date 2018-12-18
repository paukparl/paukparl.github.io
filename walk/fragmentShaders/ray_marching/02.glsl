/*
CREDITS:
Iq's ubiquitous distance functions: http://iquilezles.org/www/articles/distfunctions/distfunctions.htm
Simple raymarching setup adapted from some deleted reddit user's tutorial: https://www.reddit.com/r/twotriangles/comments/1hy5qy/tutorial_1_writing_a_simple_distance_field/
Useful maths: http://paulbourke.net/dome/fisheye/
Convenient list of lens functions: https://en.wikipedia.org/wiki/Fisheye_lens#Mapping_function
(if you know of more projections described in similar polar form let me know!)
*/

#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

const int MAX_ITER = 128;
const float MAX_DIST = 500.0;
const float EPSILON = 0.01;
const float FOG_START = 10.0;
const float FOG_END = 100.0;
const float SPIN_SPEED = 0.25;

const vec4 fogColor = vec4(0.08, 0.15, 0.22, 1.0);
const vec4 shadowColor = vec4(1.0, 0.15, 0.22, 1.0);
const vec4 lightColor  = vec4(1.00, 0.96, 0.91, 1.0);

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec2 orient;
vec3 cameraTarget;
vec3 cameraPosition;

vec3 rayPos;



mat3 rotationMatrix(float yaw, float pit)
{
  return mat3(  cos(yaw),  sin(yaw)*cos(pit),  sin(yaw)*cos(pit),
                0,         cos(pit),          -sin(pit),
               -sin(yaw),  cos(yaw)*sin(pit),  cos(yaw)*cos(pit));
}


float sdBox( vec3 p, vec3 b )
{
  vec3 d = abs(p) - b;
  return length(max(d,0.0))
         + min(max(d.x,max(d.y,d.z)),0.0); // remove this line for an only partially signed sdf 
}

float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}

float sdPlane( vec3 p, vec4 n )
{
  // n must be normalized
  return dot(p,n.xyz) + n.w;
}

float sdCappedCylinder( vec3 p, vec2 h )
{
  vec2 d = abs(vec2(length(p.xz),p.y)) - h;
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}



vec3 rotX(vec3 p,float a){return vec3(p.x,p.y*cos(a)-p.z*sin(a),p.y*sin(a)+p.z*cos(a));}
vec3 rotY(vec3 p,float a){return vec3(p.x*cos(a)-p.z*sin(a),p.y,p.x*sin(a)+p.z*cos(a));}
vec3 rotZ(vec3 p,float a){return vec3(p.x*cos(a)-p.y*sin(a), p.x*sin(a)+p.y*cos(a), p.z);}



float geometry( float march,
                int type, 
                bool reflected,
                vec3 dimensions,
                vec3 cell,
                vec3 rot,
                vec3 transition)
{  
  vec3 q;
  if (type != 1) q = mod(rayPos, cell)-0.5*cell;
  else q = rayPos;
  

  if (reflected) {
    q = abs(q);
  }

  q = rotX(q, rot.x);
  q = rotY(q, rot.y);
  q = rotZ(q, rot.z);

  q -= transition;

  

  
  
  float marchNew;
  if (type==1) {
    marchNew = sdPlane(rayPos, vec4(0., -1., 0., 0.5));
  } else if (type==2) {
    marchNew = sdSphere(q, dimensions.x);
  } else if (type==3) {
    marchNew = sdBox(q, dimensions);
  } else if (type==4) {
    marchNew = sdCappedCylinder(q, dimensions.xy);
  // } else {
  }

  return min(march, marchNew);
}


float distanceField()
{
  float march = MAX_DIST;

  march = geometry( march, 
                    1,
                    true,
                    vec3(0.),   // dimensions
                    vec3(0.),   // cell dimensions
                    vec3(0.),   // rotations
                    vec3(0.));  // transition
  march = geometry( march, 
                    2,  
                    true,
                    vec3(1.),
                    vec3(3., 3.+u_time, 3.),
                    vec3(0.),
                    vec3(0.));
  march = geometry( march, 
                    3,
                    true,
                    vec3(0.5),
                    vec3(3., 3., 3.),
                    vec3(0., u_time/3., u_time),
                    vec3(0.));
  march = geometry( march, 
                    4,
                    true,
                    vec3(0.1, 1., 0.),
                    vec3(3., 3., 3.),
                    vec3(1., u_time, 1.),
                    vec3(0.));
  march = geometry( march, 
                    2,
                    false,
                    vec3(20.),
                    vec3(0.),
                    vec3(0.),
                    vec3(8., 0., 30.));

  return march;
}


vec3 hsv(float h,float s,float v)
{
  return ((clamp(abs(fract(h+vec3(0.,.666,.333))*6.-3.)-1.,0.,1.)-1.)*s+1.)*v;
}








void main()
{
  orient.x = u_mouse.x*2.-1.;
  orient.y = u_mouse.y*PI*2./5.; // upper rotation 0 <> 2/5 PI = 72 degrees
  
  vec3 up = vec3(0., 1., 0.);
  
  cameraPosition = vec3(0., 0., u_time*0.6);
  vec3 cameraForward = normalize(vec3(0., 0., 1.));
  vec3 cameraRight = normalize(cross(cameraForward, up));
  vec3 cameraUp = cross(cameraForward, cameraRight);
  
  
  mat3 cameraOrientation = mat3(cameraRight, cameraUp, cameraForward);
  
  vec2 screen = -1.0 + 2.0 * gl_FragCoord.xy / u_resolution.xy;
  
  screen.x *= u_resolution.x / u_resolution.y;
  
  float aperture = orient.x * 2.0*PI;
  float f = 1.0/(1.-length(orient)/4.); // focal length slightly decreases with rotation from center
  float r = length(screen);
  float phi = atan(screen.y, screen.x);
  float theta;
  
  theta = r/f;
  // theta = atan(r/(2.0*f))*2.0;
  vec3 rayDir = cameraOrientation * vec3(sin(theta)*cos(phi), sin(theta)*sin(phi), cos(theta));
  rayDir *= rotationMatrix(-orient.x, orient.y);

  


  
  //Raymarch
  vec4 finalColor = fogColor;
  float totalDist = 0.0;
  float dist = EPSILON;
  float iter;

  rayPos = cameraPosition;
  for (int i = 0; i < MAX_ITER; i++)
  {
      dist = distanceField();
      totalDist += dist;

      if (dist < EPSILON || totalDist > MAX_DIST)
        break;

      rayPos += dist * rayDir;
      iter += 1.;
  }
  
  //Shade
  if (dist < EPSILON)
  {
      // float lightStrength = max(0.0, dot(sunDir, normal));
      // lightStrength = pow(lightStrength, 4.);
      // lightStrength = dither(ditherCoords, lightStrength);
      iter /= float(MAX_ITER);
      finalColor = vec4(hsv(iter, 1., 1.), 1.);
      
      // float fogStrength = smoothstep(FOG_START, FOG_END, totalDist);
      // // fogStrength = dither(ditherCoords, fogStrength);
      
      // finalColor = mix(finalColor, fogColor, fogStrength);
  }
  
  gl_FragColor = finalColor;
}