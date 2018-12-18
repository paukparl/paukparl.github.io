// Author @patriciogv ( patriciogonzalezvivo.com ) - 2015

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;



vec2 brickTile(vec2 _st, float _zoom){
    _st *= _zoom;

    float pace = u_time*10.;

    float phase1 = step(1., mod(pace,2.));
    float phase2 = step(2., mod(pace,4.));

    _st.x += step(1., mod(phase1,2.0)) * pace * step(1., mod(_st.y+phase2, 2.));
    _st.y += step(1., mod(phase1+1.,2.0)) * pace * step(1., mod(_st.x+phase2, 2.));;
    // } else {
    //   _st.y += step(1., mod(_st.x+step(2.0, step2),2.0)) * pace;
    // }
    return fract(_st);
}

float box(vec2 _st, vec2 _size){
    _size = vec2(0.5)-_size*0.5;
    vec2 uv = smoothstep(_size,_size+vec2(1e-4),_st);
    uv *= smoothstep(_size,_size+vec2(1e-4),vec2(1.0)-_st);
    return uv.x*uv.y;
}

float rand(float co){
    return fract(sin(co) * 43758.5453);
}
float noise(in float x) {
  float i = floor(x);  // integer
  float f = fract(x);  // fraction
  float y = rand(i); // built-in function
  y = mix(rand(i), rand(i + 1.0), f);
  y = mix(rand(i), rand(i + 1.0), smoothstep(0.,1.,f));
  return y;
}

void main(void){
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0);
    float asp = u_resolution.x/u_resolution.y;
    st.x *= asp;
    st -= u_time*0.1;
    

    // color = vec3(abs(sin(st.x*3.)), abs(sin(st.y*3.+1.5)), 1.);
    color = vec3(noise(u_time*20.) + 0.5) ;
    // Apply the brick tiling
    st = brickTile(st,50.0);

    color *= vec3(box(st,vec2(0.4)));

    // Uncomment to see the space coordinates
    // color = vec3(st,0.0);

    gl_FragColor = vec4(color,1.0);
}
