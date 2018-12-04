// Ray Marching Tutorial (With Shading)
// By: Brandon Fogerty
// bfogerty at gmail dot com
// xdpixel.com

// Ray Marching is a technique that is very similar to Ray Tracing.
// In both techniques, you cast a ray and try to see if the ray intersects
// with any geometry.  Both techniques require that geometry in the scene
// be defined using mathematical formulas.  However the techniques differ
// in how the geometry is defined mathematically.  As for ray tracing,
// we have to define geometry using a formula that calculates the exact
// point of intersection.  This will give us the best visual result however
// some types of geometry are very hard to define in this manner.
// Ray Marching using distance fields to decribe geometry.  This means all
// we need to know to define a kind of geometry is how to mearsure the distance
// from any arbitrary 3d position to a point on the geometry.  We iterate or "march"
// along a ray until one of two things happen.  Either we get a resulting distance
// that is really small which means we are pretty close to intersecting with some kind
// of geometry or we get a really huge distance which most likely means we aren't
// going to intersect with anything.

// Ray Marching is all about approximating our intersection point.  We can take a pretty
// good guess as to where our intersection point should be by taking steps along a ray
// and asking "Are we there yet?".  The benefit to using ray marching over ray tracing is
// that it is generally much easier to define geometry using distance fields rather than
// creating a formula to analytically find the intersection point.  Also, ray marching makes
// certain effects like ambient occlusion almost free.  It is a little more work to compute
// the normal for geometry.  I will cover more advanced effects using ray marching in a later tutorial.
// For now,  we will simply ray march a scene that consists of a single sphere at the origin.
// We will not bother performing any fancy shading to keep things simple for now.

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

//-----------------------------------------------------------------------------------------------
// The sphere function takes in a point along the ray
// we are marching and a radius.  The sphere function
// will then return the distance from the input point p
// to the closest point on the sphere.  The sphere is assumed
// to be centered on the origin which is (0,0,0).
float sphere( vec3 p, float radius )
{
    return length( p ) - radius; //distance from p to the closest point on the sphere
}

//-----------------------------------------------------------------------------------------------
// The map function is the function that defines our scene.
// Here we can define the relationship between various objects
// in our scene.  To keep things simple for now, we only have a single
// sphere in our scene.
float map( vec3 p )
{
  p.x=mod(p.x,4.0)-2.0;
  p.y=mod(p.y,4.0)-2.0;
  p.z=mod(p.z,4.0)-2.0;
  return sphere( p, 1.5 ); // sphere size change
}

//-----------------------------------------------------------------------------------------------
// This function will return the normal of any point in the scene.
// This function is pretty expensive so if you need the normal, you should
// call this function once and store the result.  Essentially the way it works
// is by offsetting the input point "p" along each axis and then determining the
// change in distance at each new point along each axis.
vec3 getNormal( vec3 p )
{
  vec3 e = vec3( 0.001, 0.00, 0.00 );

  float deltaX = map( p + e.xyy ) - map( p - e.xyy );
  float deltaY = map( p + e.yxy ) - map( p - e.yxy );
  float deltaZ = map( p + e.yyx ) - map( p - e.yyx );

  return normalize( vec3( deltaX, deltaY, deltaZ ) );
}

//-----------------------------------------------------------------------------------------------
// The trace function is our integration function.
// Given a starting point and a direction, the trace
// function will return the distance from a point on the ray
// to the closest point on an object in the scene.  In order for
// the trace function to work properly, we need functions that
// describe how to calculate the distance from a point to a point
// on a geometric object.  In this example, we have a sphere function
// which tells us the distance from a point to a point on the sphere.
float trace( vec3 origin, vec3 direction, out vec3 p )
{
  float totalDistanceTraveled = 0.0;

  // When ray marching,  you need to determine how many u_times you
  // want to step along your ray.  The more steps you take, the better
  // image quality you will have however it will also take longer to render.
  // 32 steps is a pretty decent number.  You can play with step count in
  // other ray marchign examples to get an intuitive feel for how this
  // will affect your final image render.
  for( int i=0; i < 32; ++i)
  {
    // Here we march along our ray and store the new point
    // on the ray in the "p" variable.
    p = origin + direction * totalDistanceTraveled;

    // "distanceFromPointOnRayToClosestObjectInScene" is the
    // distance traveled from our current position along
    // our ray to the closest point on any object
    // in our scene.  Remember that we use "totalDistanceTraveled"
    // to calculate the new point along our ray.  We could just
    // increment the "totalDistanceTraveled" by some fixed amount.
    // However we can improve the performance of our shader by
    // incrementing by the distance returned by our map function. 
    // This works because our map function simply returns the distance from 
    // some arbitrary point "p" to the closest
    // point on any geometric object in our scene.  We know we are probably about
    // to intersect with an object in the scene if the resulting distance is very small.
    float distanceFromPointOnRayToClosestObjectInScene = map( p );
    totalDistanceTraveled += distanceFromPointOnRayToClosestObjectInScene;

    // If our last step was very small, that means we are probably very close to
    // intersecting an object in our scene.  Therefore we can improve our performance
    // by just pretending that we hit the object and exiting early.
    if( distanceFromPointOnRayToClosestObjectInScene < 0.01 )
    {
        break;
    }

    // If on the other hand our totalDistanceTraveled is a really huge distance,
    // we are probably marching along a ray pointing to empty space.  Again,
    // to improve performance,  we should just exit early.  We really only want
    // the trace function to tell us how far we have to march along our ray
    // to intersect with some geometry.  In this case we won't intersect with any
    // geometry so we will set our totalDistanceTraveled to 0.00.
    if( totalDistanceTraveled > 100.0 )
    {
      totalDistanceTraveled = 0.;
      break;
    }
  }

  return totalDistanceTraveled;
}

//-----------------------------------------------------------------------------------------------
// Standard Blinn lighting model.
// This model computes the diffuse and specular components of the final surface color.
vec3 calculateLighting(vec3 pointOnSurface, vec3 surfaceNormal, vec3 lightPosition, vec3 cameraPosition)
{
    vec3 fromPointToLight = normalize(lightPosition - pointOnSurface);
    float diffuseStrength = clamp( dot( surfaceNormal, fromPointToLight ), 0.0, 1.0 );

    vec3 diffuseColor = diffuseStrength * vec3( 1.0, 1.0, 1.0 );
    vec3 reflectedLightVector = normalize( reflect( -fromPointToLight, surfaceNormal ) );

    vec3 fromPointToCamera = normalize( cameraPosition - pointOnSurface );
    float specularStrength = pow( clamp( dot(reflectedLightVector, fromPointToCamera), 0.0, 1.0 ), 10.0 );

    // Ensure that there is no specular lighting when there is no diffuse lighting.
    specularStrength = min( diffuseStrength, specularStrength );
    vec3 specularColor = specularStrength * vec3( 1.0 );

    vec3 finalColor = diffuseColor + specularColor;

    return finalColor;
}

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}


//-----------------------------------------------------------------------------------------------
// This is where everything starts!
void main( void )
{
  vec2 uv = ( gl_FragCoord.xy / u_resolution.xy ) * 2.0 - 1.0;
  uv.x *= u_resolution.x / u_resolution.y;

  vec3 cameraPosition = vec3(0, 0, 0 );
  // vec3 cameraPosition = vec3(0., 0., -10. );

  // We will need to shoot a ray from our camera's position through each pixel.  To do this,
  // we will exploit the uv variable we calculated earlier, which describes the pixel we are
  // currently rendering, and make that our direction vector.
  vec3 cameraDirection = normalize( vec3( uv.x , uv.y, 1.));
  cameraDirection.xz *= rotate2d(u_time);

  // Now that we have our ray defined,  we need to trace it to see how far the closest point
  // in our world is to this ray.  We will simply shade our scene.
  vec3 pointOnSurface;
  float distanceToClosestPointInScene = trace( cameraPosition, cameraDirection, pointOnSurface );

  // We will now shade the sphere if our ray intersected with it.
  vec3 finalColor = vec3(0.0);
  if( distanceToClosestPointInScene > 0.0 )
  {
      // vec3 lightPosition = vec3( 0.0, 4.5, -10.0 );
      // vec3 surfaceNormal = getNormal( pointOnSurface );
      // finalColor = calculateLighting( pointOnSurface, surfaceNormal, lightPosition, cameraPosition );
      finalColor = vec3(1. / (1. + distanceToClosestPointInScene * distanceToClosestPointInScene * 0.05));
  } else {
    finalColor = vec3(1.);
  }

  gl_FragColor = vec4( finalColor, 1.0 );
}