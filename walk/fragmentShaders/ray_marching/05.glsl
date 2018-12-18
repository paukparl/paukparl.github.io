#ifdef GL_ES
precision highp float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

//--- pixelator
// by Catzpaw 2018

#define LINES 256.
uniform sampler2D renderbuffer; 
bool pixelator(){
	return true;
}


//--- donuts
// by Catzpaw 2018

#define OCT 5
#define ITER 128
#define EPS 0.005
#define NEAR .0
#define FAR 16.

vec3 rotX(vec3 p,float a){return vec3(p.x,p.y*cos(a)-p.z*sin(a),p.y*sin(a)+p.z*cos(a));}
vec3 rotY(vec3 p,float a){return vec3(p.x*cos(a)-p.z*sin(a),p.y,p.x*sin(a)+p.z*cos(a));}
vec3 rotZ(vec3 p,float a){return vec3(p.x*cos(a)-p.y*sin(a), p.x*sin(a)+p.y*cos(a), p.z);}
vec3 hsv(float h,float s,float v){return ((clamp(abs(fract(h+vec3(0.,.666,.333))*6.-3.)-1.,0.,1.)-1.)*s+1.)*v;}
float torusArray(vec3 p){
  return length(vec2(
                  length(p.xy)-.02,
                  p.z
                  // fract(p.z*20.+10.)*0.05-.025
                  // fract(p.z*20.+10.)*.05-.025
                ))-.005;
}

float map(vec3 p){
  float r=FAR,s=.15;
  // p=rotX(p,-u_time*.31);
  // p=rotY(p,u_time*.21);
  p=fract(p)-.5;
	for(int i=0;i<OCT;i++){
		p=abs(p)-s-.01;
    p=rotX(p,u_time*.0673);
    p=rotY(p,u_time*.0061);
    p=rotZ(p,u_time*.0839);
		r=min(r,torusArray(p)-.001);
		s*=.5;p*=1.2;
	}
	return r;
}

float trace(vec3 ro,vec3 rd,out float n){
  float t=NEAR,d;
	for(int i=0;i<ITER;i++)
  {
    d=map(ro+rd*t);
    if(abs(d)<EPS||t>FAR)break;
    t+=step(d,1.)*d*.2+d*.5;
    n+=1.;
  }
	return min(t,FAR);}

void main(void){if(pixelator()){
	vec2 uv=(gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;
	float n=0.,v=trace(vec3(.5,.5,.0),vec3(uv,-.4),n)*.3;n/=float(ITER);
	gl_FragColor=vec4(mix(hsv(n+u_time*.05,.5,n),vec3(1),n),1);
}}