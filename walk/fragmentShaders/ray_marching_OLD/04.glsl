
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;


float sphere( vec3 p, float radius )
{
    return length( p ) - radius;
}


float sdBox( vec3 p, vec3 b ) {
  vec3 d = abs(p) - b;
  return length(max(d,0.0))
         + min(max(d.x,max(d.y,d.z)),0.0); // remove this line for an only partially signed sdf 
}


float map( vec3 p )
{    
    return sphere( p, 3.0 );
}

vec3 getNormal( vec3 p )
{
    vec3 e = vec3( 0.001, 0.00, 0.00 );
    
    float deltaX = map( p + e.xyy ) - map( p - e.xyy );
    float deltaY = map( p + e.yxy ) - map( p - e.yxy );
    float deltaZ = map( p + e.yyx ) - map( p - e.yyx );
    
    return normalize( vec3( deltaX, deltaY, deltaZ ) );
}


float trace( vec3 origin, vec3 direction, out vec3 p )
{
    float totalDistanceTraveled = 0.0;


    for( int i=0; i <32; ++i)
    {
        p = origin + direction * totalDistanceTraveled;

        float distanceFromPointOnRayToClosestObjectInScene = map( p );
        totalDistanceTraveled += distanceFromPointOnRayToClosestObjectInScene;

        if( distanceFromPointOnRayToClosestObjectInScene < 0.0001 )
        {
            break;
        }

        if( totalDistanceTraveled > 10000.0 )
        {
            totalDistanceTraveled = 0.0000;
            break;
        }
    }

    return totalDistanceTraveled;
}

vec3 calculateLighting(vec3 pointOnSurface, vec3 surfaceNormal, vec3 lightPosition, vec3 cameraPosition)
{
  vec3 fromPointToLight = normalize(lightPosition - pointOnSurface);
  float diffuseStrength = clamp( dot( surfaceNormal, fromPointToLight ), 0.0, 1.0 );
  
  vec3 diffuseColor = diffuseStrength * vec3( u_mouse.x, 0.0, u_mouse.y );
  vec3 reflectedLightVector = normalize( reflect( -fromPointToLight, surfaceNormal ) );
  
  vec3 fromPointToCamera = normalize( cameraPosition - pointOnSurface );
  float specularStrength = pow( clamp( dot(reflectedLightVector, fromPointToCamera), 0.0, 1.0 ), 20.0 );

  specularStrength = min( diffuseStrength, specularStrength );
  vec3 specularColor = specularStrength * vec3( 1.0 );
  
  vec3 finalColor = diffuseColor + specularColor; 

  return finalColor;
}

void main( void ) 
{
  vec2 uv = ( gl_FragCoord.xy / u_resolution.xy ) * 2.0 - 1.0;
  
  uv.x *= u_resolution.x / u_resolution.y;

  vec3 cameraPosition = vec3( 0.0, 0.0, -10.0 );
  
  vec3 cameraDirection = normalize( vec3( uv.x, uv.y, 1.0) );

  vec3 pointOnSurface;
  float distanceToClosestPointInScene = trace( cameraPosition, cameraDirection, pointOnSurface );
  
  vec3 finalColor = vec3(0.0);
  if( distanceToClosestPointInScene > 0.0 )
  {
      vec3 lightPosition = vec3( -5.*sin(u_time), 10., -5.*cos(u_time));
      vec3 surfaceNormal = getNormal( pointOnSurface );
      finalColor = calculateLighting( pointOnSurface, surfaceNormal, lightPosition, cameraPosition );
  }
  
  gl_FragColor = vec4( finalColor, 1.0 );
}