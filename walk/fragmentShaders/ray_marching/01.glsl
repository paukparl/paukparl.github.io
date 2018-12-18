#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
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

bg


void main( void )
{
  vec2 uv = ( gl_FragCoord.xy / u_resolution.xy ) * 2.0 - 1.0;
  uv.x *= u_resolution.x / u_resolution.y;

  vec3 cameraPosition = vec3(0, 0, 0 );
  vec3 cameraDirection = normalize( vec3( uv.x , uv.y, 1.));
  cameraDirection.xz *= rotate2d(u_time);

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
  if (finalColor.b > 0.75) {
    finalColor = vec4(backdrop, 1.0);
  } else {
    finalColor = vec4(vec3(finalColor.r),1.);
  }
  
  gl_FragColor = finalColor;
  // gl_FragColor = vec4( finalColor, 1.0 );
}