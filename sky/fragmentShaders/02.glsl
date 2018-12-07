#ifdef GL_ES
precision mediump float;
#endif

// #extension GL_OES_standard_derivatives : enable

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

uniform float u_a;
uniform float u_b;
uniform float u_g;

uniform sampler2D u_texture;


varying vec2 v_texcoord;

//--- donuts
// by Catzpaw 2018

#define OCT 3
#define ITER 30
#define EPS 0.01
#define NEAR .0
#define FAR 30.


vec3 rotX(vec3 p,float a){return vec3(p.x,p.y*cos(a)-p.z*sin(a),p.y*sin(a)+p.z*cos(a));}
vec3 rotY(vec3 p,float a){return vec3(p.x*cos(a)-p.z*sin(a),p.y,p.x*sin(a)+p.z*cos(a));}
vec3 rotZ(vec3 p,float a){return vec3(p.x*cos(a)-p.y*sin(a), p.x*sin(a)+p.y*cos(a), p.z);}
vec3 hsv(float h,float s,float v){return ((clamp(abs(fract(h+vec3(0.,.666,.333))*6.-3.)-1.,0.,1.)-1.)*s+1.)*v;}
float torusArray(vec3 p){
  return length(vec2(length(p.xy)-.02,fract(p.z*20.+10.)*.05-.025));
  // return length(vec2(length(p.xy)-.02,p.z));
}

float map(vec3 p){
  float r=FAR;
  float s=.15;
  p=rotX(p,0.);
  p=rotY(p,0.);
  p=fract(p+.5)-.5;
	for(int i=0;i<OCT;i++){
		p=abs(p)-s-.01;
    p=rotX(p,u_time*.0673);
    p=rotY(p,u_time*.0061);
    p=rotZ(p,u_time*.0839);
		r=torusArray(p);
		s*=.5;p*=1.4;
	}
	return r;
}

float trace(vec3 ro,vec3 rd){
  float t=NEAR;
  float d;
  float n;
	for(int i=0;i<ITER;i++){
    d=map(ro+rd*t);
    if(abs(d)<EPS||t>FAR)break;
    t+=step(d,1.)*d*.2+d*.5;
    n+=1.;
  }
  return n;
}

mat3 rotate3d(float a, float b, float g) 
{
  return mat3(
    cos(a)*cos(b), cos(a)*sin(b)*sin(g)-sin(a)*cos(g), cos(a)*sin(b)*cos(g)+sin(a)*sin(g),
    sin(a)*cos(b), sin(a)*sin(b)*sin(g)+cos(a)*cos(g), sin(a)*sin(b)*cos(g)-cos(a)*sin(g),
    -sin(b), cos(b)*sin(g), cos(b)*cos(g)
  );
}



void main(void){
  vec3 cameraPosition = vec3(0., 0., 0. );
	vec2 uv=(gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;
  vec3 cameraDirection = normalize( vec3( uv.x, uv.y, 0.5));
  cameraDirection *= rotate3d(u_g, -u_a, -u_b);
	float n=0.;
  n = trace(cameraPosition,cameraDirection)*0.3/float(ITER);


  vec3 backdrop = mix(hsv(n+u_time*.05,1.,1.),vec3(0., 1., 0.),n);
  
  vec4 finalColor = texture2D(u_texture, v_texcoord);
  // vec4 finalColor = vec4(1.0, 1.0, 1.0, 1.0);
  if (finalColor.b > 0.75) {
  // if (finalColor.b > 0.2) {
    finalColor = vec4(backdrop, 1.0);
  } 

  gl_FragColor= finalColor;

}
