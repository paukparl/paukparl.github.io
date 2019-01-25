#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float dot2(vec3 p) {
    return dot(p,p);
}

float map(vec3 p) {
    float len = 0.0;
    
    for(float i = 1.0; i < 10.0; i++) {
        vec3 sphere = vec3(sin(u_time*i*0.1),cos(u_time*i*0.12),0.0)*10.0;
        len += 1.0/dot2(p-sphere);
    }
    
    return (inversesqrt(len)-1.0)*3.0;
}

vec3 findcolor(vec3 p) {
    float len = 10000.0;
    vec3 color;
    for(float i = 1.0; i < 5.0; i++) {
        float len2 = dot2(p-vec3(sin(u_time*i*0.1),cos(u_time*i*0.12),0.0)*10.0);
        
        //random colors
        color = mix(
                  vec3(
                    1.,
                    fract(1.0/fract(i*3.14)),
                    fract(i*3.14)),
                  color, 
                  clamp((len2-len)*0.1+0.5, 0.0, 1.0)
                );
        
        len = mix(len2,len,clamp((len2-len)*0.1+0.5,0.0,1.0));
    }
    return color;
}

vec3 findnormal(vec3 p) {
    vec2 eps = vec2(0.01,0.0);
    
    return normalize(vec3(
        map(p+eps.xyy)-map(p-eps.xyy),
        map(p+eps.yxy)-map(p-eps.yxy),
        map(p+eps.yyx)-map(p-eps.yyx)));
}

vec2 unstretch( in vec2 resolution, in vec2 st ) {
  if (resolution.x > resolution.y) st.x *= resolution.x/resolution.y;
  else st.y *= resolution.y/resolution.x;
  return st;
}

void main()
{
	vec2 st = gl_FragCoord.xy/u_resolution.xy;
  st = st * 2. - 1.;
  st = unstretch( u_resolution, st);

  // same as above code
  // vec2 st = (gl_FragCoord.xy*2.0-u_resolution.xy) / u_resolution.y;
    
  vec3 ro = vec3(0.0,0.0,-20.0);
  vec3 rd = normalize(vec3(st,1.5));
  float len = 0.0;
  float dist = 0.0;

  for (int i = 0; i < 30; i++) {
    len = map(ro);
    dist += len;
    ro += rd * len;
    if (dist > 50.0 || len < 0.01) {
      break;
    }
  }
  vec3 color = vec3(0.);
  if (dist < 30.0 && len < 0.01) {
    vec3 sun = normalize(vec3(-1.0));
    // vec3 objnorm = findnormal(ro);
    // vec3 reflectnorm = reflect(rd,objnorm);
    color += findcolor(ro);
    
    // gl_FragColor = vec4(color*max(0.2,0.8*dot(objnorm,sun)),1.0);
    // gl_FragColor = max(gl_FragColor,(dot(reflectnorm,sun)-0.9)*12.0);
  }
  gl_FragColor = sqrt(vec4(color, 1.));
}