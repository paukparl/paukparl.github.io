#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define N 3

// signed distance to a regular n-gon
float sdNGon( in vec2 p, in float r ) {
  const float k = sqrt(3.0);
    
    p.x = abs(p.x) - 1.0;
    // p.y = p.y + 1.0/k;
    
    if( p.x + k*p.y > 0.0 ) {
      p = vec2( p.x - k*p.y, -k*p.x - p.y )/2.0;
    }
    
    p.x -= clamp( p.x, -2.0, 0.0 );
    
    return -length(p)*sign(p.y);
}

float sdCircle( vec2 p, float r )
{
  return length(p) - r;
}

float sdLine( in vec2 p, in vec2 a, in vec2 b )
{
  vec2 pa = p-a, ba = b-a;
  float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
  return length( pa - ba*h );
}

vec2 unstretch( in vec2 resolution, in vec2 st ) {
  if (resolution.x > resolution.y) st.x *= resolution.x/resolution.y;
  else st.y *= resolution.y/resolution.x;
  return st;
}

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy; // 0 <> 1
  st = (st-0.5)*2.;
  st = unstretch(u_resolution, st);
    
	// float d = sdNGon( st, 0.5 );
  // float d = sdCircle( st, 1.); 
  float d = sdLine( st, vec2(0.5), vec2(-0.3));

  vec3 col = vec3(d)*10.;
	// col *= 1.0 - exp(-2.0*abs(d));
	// col *= 0.8 + 0.2*cos(60.0*d);
	// col = mix( col, vec3(1.0), 1.0-smoothstep(0.0,0.02,abs(d)) );
  
  // vec3 col = vec3(st.x);
	gl_FragColor = vec4(col,1.0);
}