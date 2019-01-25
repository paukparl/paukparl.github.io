
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;


float sphere( vec3 p, float radius )
{
    return length( p ) - radius;
}

float map( vec3 p )
{    
    return sphere( p, 40. );
}

vec3 trace( vec3 origin, vec3 direction )
{
    float totalDistanceTraveled = 0.0;
    
    
    for( int i=0; i <32; ++i)
    {
      
        vec3 p = origin + direction * totalDistanceTraveled;

        float distanceFromPointOnRayToClosestObjectInScene = map( p );
        totalDistanceTraveled += distanceFromPointOnRayToClosestObjectInScene;


        if( distanceFromPointOnRayToClosestObjectInScene < 0.000001 )
        {
          float i_float = float(i);
          if (i == int(floor(u_mouse.x*float(32-1)))) {
            return vec3(u_mouse.x, 0, i_float/20.0);
          }
          
          return vec3(20.0, 0, 0);
          
        }

        if( totalDistanceTraveled > 10000.0 )
        {
            totalDistanceTraveled = 0.0;
            break;
        }
    }
    return vec3(totalDistanceTraveled, 0., 0.);
}

void main( void ) 
{
    vec2 uv = ( gl_FragCoord.xy / u_resolution.xy ) * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;

    vec3 cameraPosition = vec3( 0.0, 0.0, -100.0 );
    
    vec3 cameraDirection = normalize( vec3( uv.x, uv.y, 1.0) );


    vec3 distanceToClosestPointInScene = trace( cameraPosition, cameraDirection );

    vec3 finalColor = distanceToClosestPointInScene;
    
    gl_FragColor = vec4( finalColor, 1.0 );
}