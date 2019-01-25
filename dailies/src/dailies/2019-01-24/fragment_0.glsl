#ifdef GL_ES
precision mediump float;
#endif

//================ UNIFORMS

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// if you change this, try making it a square number (1,4,9,16,25,...)
#define samples 1

#define numballs 5

//================ VARIABLES

vec4 blobs[numballs];

//================ FUNCTIONS

float rand1( float n )
{
    return fract(sin(n)*43758.5453123);
}

vec2 rand2( float n )
{
    return fract(sin(vec2(n,n+1.0))*vec2(43758.5453123,22578.1459123));
}

vec3 rand3( float n )
{
    return fract(sin(vec3(n,n+1.0,n+2.0))*vec3(43758.5453123,22578.1459123,19642.3490423));
}

float sdSphere( vec3 p, vec3 origin, float radius ) 
{
  return length(p-origin)-radius;
}

float opSmoothUnion( float d1, float d2, float k ) 
{
  float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
  return mix( d2, d1, h ) - k*h*(1.0-h); 
}

float sdMetaBalls( vec3 pos )
{
  float d_fin = 100000.;

  for ( int i=0; i<numballs; i++ ) {
    float d_ind = sdSphere( pos, blobs[i].xyz, blobs[i].w);
    d_fin = opSmoothUnion( d_fin, d_ind, 1.0 );
  }

  return d_fin;


  // @@@@@@@@@@@@@@@@@@@@
	
}



float map( in vec3 p )
{
	return sdMetaBalls( p );
}




const float PRECIS = 0.01;
float MAX_D = 16.0;

vec2 intersect( in vec3 ro, in vec3 rd )
{
    float h = PRECIS*2.0;
    float len = 0.0;
    float m = 1.0;

    for( int i=0; i<75; i++ )
    {
      if( h<PRECIS || len>MAX_D ) break; // why continue;?
      len += h;
	    h = map( ro+rd*len );
    }
    
    // out of maximum ray length
    if( len > MAX_D ) m=-1.0;
    return vec2( len, m );
}


void main()
{
  //-----------------------------------------------------
  // input
  //-----------------------------------------------------

	vec2 q = gl_FragCoord.xy / u_resolution.xy;

	vec2 m = vec2(0.5);
	// if( iMouse.z>0.0 ) m = iMouse.xy/u_resolution.xy;

  //-----------------------------------------------------
  // montecarlo (over time, image plane and lens) (5D)
  //-----------------------------------------------------

	float msamples = sqrt(float(samples));
	


	vec3 tot = vec3(0.0);
	#if samples>1
	for( int a=0; a<samples; a++ )
    #else
    float a = 0.0;
    #endif		
	{
		vec2  poff = vec2( mod(float(a),msamples), floor(float(a)/msamples) )/msamples;
		#if samples>4
    float toff = 0.0;
		#else
    float toff = 0.0*(float(a)/float(samples)) * (0.5/24.0); // shutter time of half frame
    #endif
		
    //-----------------------------------------------------
    // animate scene
    //-----------------------------------------------------
		float time = u_time + toff;

    // move metaballs
		for( int i=0; i<numballs; i++ )
    {
      float h = float(i)/8.0;
      blobs[i].xyz = 2.0*sin( 6.2831*rand3(h*1.17) + rand3(h*13.7)*time );
      blobs[i].w = 1.3;
		}
    // move camera		
		// float an = 0.5*time - 6.2831*(m.x-0.5);
		vec3 ro = vec3(0, 0, 10.);
    vec3 target = vec3(0.0,0.0,0.0);



		//-----------------------------------------------------
    // camera
    //-----------------------------------------------------
    // image plane		
		vec2 p = -1.0 + 2.0 * (gl_FragCoord.xy + poff) / u_resolution.xy;
    p.x *= u_resolution.x/u_resolution.y;
    // // camera matrix
    vec3 ww = normalize( target - ro );
    vec3 uu = normalize( cross(ww,vec3(0.0,1.0,0.0) ) );
    vec3 vv = normalize( cross(uu,ww));


    // create view ray
    vec3 rd = normalize( p.x*uu + p.y*vv + 2.0*ww );


    // // dof
    // #if samples >= 9
    // vec3 fp = ro + rd * 5.0;
		// vec2 le = -1.0 + 2.0*rand2( dot(fragCoord.xy,vec2(131.532,73.713)) + float(a)*121.41 );
    // ro += ( uu*le.x + vv*le.y )*0.1;
    // rd = normalize( fp - ro );
    // #endif		

		//-----------------------------------------------------
    // render
    //-----------------------------------------------------

    // background
    vec3 col = vec3(1., 0.01, 0.01);
  
    // raymarch
    vec2 tmat = intersect(ro,rd);

    // if hit target
    if( tmat.y>0. )
    {
      // geometry
      vec3 pos = ro + tmat.x*rd;
      // vec3 nor = vec3(0);

      // materials
      if ()

      // for( int i=0; i<numballs; i++ )
      // {
      //   float dist = blobs[i].xyz - pos;
      // }





      vec3 mat = vec3(0);
      float w = 0.01;

      for( int i=0; i<numballs; i++ )
      {
        float h = float(i)/8.0;

        // metaball color
        vec3 ccc = vec3(1., 0.1, 0.1);
        ccc += mix( ccc, vec3(0, 0, 1.), smoothstep(0., 1., h));
        // ccc = mix( ccc, vec3(1., 0, 0), smoothstep(0.3, 1.,h));
        // ccc += mix( vec3(0), vec3(0, 0, 0.5), smoothstep(0.5, 1.,h));
        // ccc = mix( ccc, vec3(1., 1., 0), smoothstep(0.5,0.,h));
    
        // what does x do?
        // -> 
        float x = clamp( length( blobs[i].xyz - pos )/blobs[i].w, 0.0, 1.09);
        // what does p do?
        // 
        float p = 1.0 - x*x*(3.0-2.0*x);
        mat += ccc;
        // w += p;
      }
      // mat /= w;

      col = mat;



    }
		tot += col;
	}
	// tot /= float(samples);

	//-----------------------------------------------------
	// postprocessing
  //-----------------------------------------------------
  // // gamma
	// tot = pow( clamp(tot,0.0,1.0), vec3(0.45) );

	// // vigneting
  // tot *= 0.5 + 0.5*pow( 16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y), 0.15 );

  gl_FragColor = vec4( tot, 1.0 );
}






















// float m = 0.0;
// float p = 0.0;
// float dmin = 1e20;
  
// float h = 1.0; // track Lipschitz constant

// for( int i=0; i<numballs; i++ )
// {
//   float d = sdSphere( pos, blobs[i].xyz, blobs[i].w);
  
//   // db is distance between blob.xyz and p
//   float db = length( blobs[i].xyz - pos );

//   // inside blob
//   if( db < blobs[i].w ) 
//   {
//     // x is < 1
//     float x = db/blobs[i].w;
//     p += 1.0 - x*x*x*(x*(x*6.0-15.0)+10.0);
//     m += 1.0;
//     h = max( h, 0.5333*blobs[i].w );
//     ////////
//   }
//   else // bouncing sphere distance
//   {
//     dmin = min( dmin, db - blobs[i].w );
//   }
// }


// float d = dmin + 0.1;
// if( m>0.5 )
// {
// 	float th = 0.3;
// 	d = h*(th-p);
// }

// return d;