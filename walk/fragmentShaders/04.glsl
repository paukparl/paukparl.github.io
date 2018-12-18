// Author @patriciogv - 2015
// http://patriciogonzalezvivo.com

#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main(){
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    float asp = u_resolution.x/u_resolution.y;
    st.x *= asp;
    vec3 color = vec3(0.0);

    vec2 pos = vec2(0.5*asp, 0.5)-st;
    float r = length(pos)*2.0;
    float a = atan(pos.y,pos.x);

    
    float param = sin(u_time*1.)*10.+10.;

    if (param > 10.) {
      a += PI;
      param = 20.-param;
    }
    // float f = sin(a);
    float f = pow(abs(sin(a*(param))), 1.8);
    
    // f = abs(cos(a*2.5))+.3;
    // f = abs(cos(a*12.)*sin(a*3.))*.8+.1;
    // f = smoothstep(-.5,1., cos(a*10.))*0.2+0.5;

    color = vec3( 1.-smoothstep(f,f+1.,r) );

    gl_FragColor = vec4(color, 1.0);
}
