#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

uniform float u_a;
uniform float u_b;
uniform float u_g;

uniform sampler2D u_texture;


varying vec2 v_texcoord;


float sphere( vec3 p, float radius )
{
    return length( p ) - radius; //distance from p to the closest point on the sphere
}


float map( vec3 p )
{
  p.x=mod(p.x,4.0)-2.0;
  p.y=mod(p.y,4.0)-2.0;
  p.z=mod(p.z,4.0)-2.0;
  return sphere( p, 1.5 ); // sphere size change
}


float trace( vec3 origin, vec3 direction, out vec3 p )
{
  float totalDistanceTraveled = 0.0;

  for( int i=0; i < 32; ++i)
  {
    
    p = origin + direction * totalDistanceTraveled;


    float distanceFromPointOnRayToClosestObjectInScene = map( p );
    totalDistanceTraveled += distanceFromPointOnRayToClosestObjectInScene;


    if( distanceFromPointOnRayToClosestObjectInScene < 0.01 )
    {
        break;
    }
    
    if( totalDistanceTraveled > 100.0 )
    {
      totalDistanceTraveled = 0.;
      break;
    }
  }

  return totalDistanceTraveled;
}

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

mat4 rotateAround(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

mat3 rotate3d(float a, float b, float g) 
{
  return mat3(
    cos(a)*cos(b), cos(a)*sin(b)*sin(g)-sin(a)*cos(g), cos(a)*sin(b)*cos(g)+sin(a)*sin(g),
    sin(a)*cos(b), sin(a)*sin(b)*sin(g)+cos(a)*cos(g), sin(a)*sin(b)*cos(g)-cos(a)*sin(g),
    -sin(b), cos(b)*sin(g), cos(b)*cos(g)
  );
}


void main( void )
{
  vec2 uv = ( gl_FragCoord.xy / u_resolution.xy ) * 2.0 - 1.0;
  uv.x *= u_resolution.x / u_resolution.y;

  vec3 cameraPosition = vec3(0., 0., 0. );
  // vec3 cameraFront = vec3(0., 0., 1.);
  vec3 cameraRight = vec3(1., 0., 0.);
  vec3 cameraUp = vec3(0., 1., 0.);
  vec3 cameraDirection = normalize( vec3( uv.x, uv.y, 1.));
  // cameraDirection *= rotate3d(0., 0., u_mouse.y);
  cameraDirection *= rotate3d(u_a, -u_g, -u_b);
  // cameraDirection *= mat3(rotateAround(cameraUp, u_mouse.x));
  // cameraDirection *= mat3(rotateAround(cameraRight, u_mouse.y));

  
  // cameraDirection.xz *= rotate2d(u_time);
  // cameraDirection.xy *= rotate2d(u_mouse.x);

  vec3 pointOnSurface;
  float distanceToClosestPointInScene = trace( cameraPosition, cameraDirection, pointOnSurface );

  vec3 backdrop = vec3(0.0);
  if( distanceToClosestPointInScene > 0.0 )
  {
      backdrop = vec3(1. / (1. + distanceToClosestPointInScene * distanceToClosestPointInScene * 0.05));
  } else {
    backdrop = vec3(1.);
  }
  vec4 finalColor = texture2D(u_texture, v_texcoord);
  if (finalColor.b > 0.1) {
    finalColor = vec4(backdrop, 1.0);
  } else {
    finalColor = vec4(vec3(finalColor.r),1.);
  }
  
  gl_FragColor = finalColor;
  // gl_FragColor = vec4( finalColor, 1.0 );
}