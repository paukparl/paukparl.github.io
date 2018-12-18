// Infinite Walk into Generated Space
// Paul Park
// https://paukparl.com

// Signed Distance Functions: http://iquilezles.org/www/articles/distfunctions/distfunctions.htm
// Lens Distortion: https://www.shadertoy.com/view/MtV3Dd
// Art inspiration: https://www.youtube.com/watch?v=ChVbgkhu8-o

#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359

const int MAX_ITER = 256;
const float MAX_DIST = 200.0;
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
                bool subtraction,
                vec3 dimensions,
                vec3 cell,
                vec3 rot,
                vec3 transLocal,
                vec3 transGlobal)
{  
  vec3 q;

  

  if (length(cell)>0.) q = mod(rayPos, cell)-0.5*cell;
  else q = rayPos;
  
  q -= transGlobal;

  if (reflected) {
    q = abs(q);
  }

  q -= transLocal;

  q = rotX(q, rot.x);
  q = rotY(q, rot.y);
  q = rotZ(q, rot.z);

  
  float marchNew;
  if (type==1) {
    marchNew = sdPlane(rayPos, vec4(0., -1., 0., 0.5));
  } else if (type==2) {
    marchNew = sdSphere(q, dimensions.x);
  } else if (type==3) {
    marchNew = sdBox(q, dimensions);
  } else if (type==4) {
    marchNew = sdCappedCylinder(q, dimensions.xy);
  }

  if (subtraction) return max(-marchNew, march);
  return min(march, marchNew);
}


float distanceField()
{
  float march = MAX_DIST;

  // WALLS
  march = geometry( 
            // march, type, reflected, subtraction
            march, 3, true, false,
            // dimensions
            vec3(7., 7., 6.),   
            // cell dimensions
            vec3(10., sin(u_time*0.2)*2.+10., 40.),   
            // rotations
            vec3(0., u_time*0.2, u_time*0.2),   
            // transLocal
            vec3(cos(u_time*0.2), sin(u_time*0.2)*3., 2.),
            // transGlobal
            vec3(0.)); 

  // TUNNEL
  march = geometry( 
            // march, type, reflected, subtraction
            march, 3, true, true,
            // dimensions
            vec3(15., 15., 50.),   
            // cell dimensions
            vec3(0.),   
            // rotations
            vec3(sin(u_time*0.2), cos(u_time*0.2), 0.),
            // transLocal
            vec3(0., 0., 0.),
            // transGlobal
            cameraPosition);
            // vec3(0., 0., u_time*0.6));

  // WALLS
  march = geometry( 
            // march, type, reflected, subtraction
            march, 1, true, false,
            // dimensions
            vec3(0.),   
            // cell dimensions
            vec3(0.),   
            // rotations
            vec3(0.),   
            // transLocal
            vec3(0.),
            // transGlobal
            vec3(0.));

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
    iter /= float(MAX_ITER);
    finalColor = vec4(hsv(iter+ u_time/30., 1., 1.), 1.);
  } else {
    finalColor = vec4(hsv(iter + u_time/30., 1., 0.9), 1.);
  }
  
  gl_FragColor = finalColor;
}