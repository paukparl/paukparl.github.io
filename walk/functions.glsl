
// cartesian to angle

vec2 pos = vec2(0.5)-st;
float r = length(pos)*2.0;
float a = atan(pos.y,pos.x);




// hsb to rgb

vec3 hsb2rgb( in vec3 hsb ){
    vec3 rgb = clamp(abs(mod(hsb.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                     0.0,
                     1.0 );
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return hsb.z * mix(vec3(1.0), rgb, hsb.y);
}



// bar

float barVertical(in vec2 _st, in float left, in float right) {
  float pct = step(left, _st.x) * step(1.-right, 1. - _st.x);
  return pct;
}

float barHorizontal(in vec2 _st, in float bottom, in float top) {
  float pct = step(bottom, _st.y) * step(1.-top, 1.-_st.y);
  return pct;
}

float barVerticalSmooth(in vec2 _st, in float left, in float right, in float blur) {
  if (blur == 0.) return barVertical(_st, left, right);
  float pct = smoothstep(left-blur/2., left+blur/2., _st.x)
            * smoothstep(right+blur/2., right-blur/2., _st.x);
  return pct;
}

float barHorizontalSmooth(in vec2 _st, in float bottom, in float top, in float blur) {
  if (blur == 0.) return barHorizontal(_st, bottom, top);
  float pct = smoothstep(bottom-blur/2., bottom+blur/2., _st.y)
            * smoothstep(top+blur/2., top-blur/2., _st.y);
  return pct;
}

float borderedRectangle(in vec2 _st, in vec2 bl, in vec2 tr, in float weight, in float blur) {
  float pctV = barVerticalSmooth(_st, bl.x-weight*.5, bl.x+weight*.5, blur) + barVerticalSmooth(_st, tr.x-weight*.5, tr.x+weight*.5, blur);
  pctV *= barHorizontalSmooth(_st, bl.y-weight*.5, tr.y+weight*.5, blur);
  float pctH = barHorizontalSmooth(_st, bl.y-weight*.5, bl.y+weight*.5, blur) + barHorizontalSmooth(_st, tr.y-weight*.5, tr.y+weight*.5, blur);
  pctH *= barVerticalSmooth(_st, bl.x-weight*.5, tr.x+weight*.5, blur);
  return pctV + pctH;
}



// circle

float circle(in vec2 _st, in float radius, in float blur){
  vec2 dist = _st-vec2(0.5);
	return 1.-smoothstep(radius*radius+blur*.5,
                         radius*radius-blur*.5,
                         dot(dist,dist));
}



// rand

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
float rand(float co){
    return fract(sin(co) * 43758.5453);
}


// perlin noise // x could be replaced with anything like u_time
// returns 0 <> 1

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

 

// rotate (transfer shape to axis)

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}