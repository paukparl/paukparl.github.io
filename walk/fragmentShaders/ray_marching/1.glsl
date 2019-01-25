// The MIT License
// Copyright © 2017 Inigo Quilez
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


// Compressing normals by octahedral projection. 
//
// See http://www.vis.uni-stuttgart.de/~engelhts/paper/vmvOctaMaps.pdf
//
// Compare to Fibonacci: https://www.shadertoy.com/view/4t2XWK



uint octahedral_32( in vec3 nor, uint sh )
{
    nor /= ( abs( nor.x ) + abs( nor.y ) + abs( nor.z ) );
    nor.xy = (nor.z >= 0.0) ? nor.xy : (1.0-abs(nor.yx))*sign(nor.xy);
    vec2 v = 0.5 + 0.5*nor.xy;

    uint mu = (1u<<sh)-1u;
    uvec2 d = uvec2(floor(v*float(mu)+0.5));
    return (d.y<<sh)|d.x;
}



vec3 i_octahedral_32( uint data, uint sh )
{
    uint mu =(1u<<sh)-1u;
    
    uvec2 d = uvec2( data, data>>sh ) & mu;
    vec2 v = vec2(d)/float(mu);
    
    v = -1.0 + 2.0*v;
#if 1
    // Rune Stubbe's version, much faster than original
    vec3 nor = vec3(v, 1.0 - abs(v.x) - abs(v.y));
    float t = max(-nor.z,0.0);
    nor.x += (nor.x>0.0)?-t:t;
    nor.y += (nor.y>0.0)?-t:t;
#endif
#if 0
    // is there was a copysign() in GLSL...
    vec3 nor = vec3(v, 1.0 - abs(v.x) - abs(v.y));
    nor.xy -= copysign(max(-nor.z,0.0),nor.xy);
#endif
#if 0
    // original
    vec3 nor;
    nor.z = 1.0 - abs(v.x) - abs(v.y);
    nor.xy = (nor.z>=0.0) ? v.xy : (1.0-abs(v.yx))*sign(v.xy);
#endif    
    return normalize( nor );
}



//=================================================================================================
// digit drawing function by P_Malin (https://www.shadertoy.com/view/4sf3RN)
//=================================================================================================
float SampleDigit(const in float n, const in vec2 vUV)
{		
	if(vUV.x  < 0.0) return 0.0;
	if(vUV.y  < 0.0) return 0.0;
	if(vUV.x >= 1.0) return 0.0;
	if(vUV.y >= 1.0) return 0.0;
	
	float data = 0.0;
	
	     if(n < 0.5) data = 7.0 + 5.0*16.0 + 5.0*256.0 + 5.0*4096.0 + 7.0*65536.0;
	else if(n < 1.5) data = 2.0 + 2.0*16.0 + 2.0*256.0 + 2.0*4096.0 + 2.0*65536.0;
	else if(n < 2.5) data = 7.0 + 1.0*16.0 + 7.0*256.0 + 4.0*4096.0 + 7.0*65536.0;
	else if(n < 3.5) data = 7.0 + 4.0*16.0 + 7.0*256.0 + 4.0*4096.0 + 7.0*65536.0;
	else if(n < 4.5) data = 4.0 + 7.0*16.0 + 5.0*256.0 + 1.0*4096.0 + 1.0*65536.0;
	else if(n < 5.5) data = 7.0 + 4.0*16.0 + 7.0*256.0 + 1.0*4096.0 + 7.0*65536.0;
	else if(n < 6.5) data = 7.0 + 5.0*16.0 + 7.0*256.0 + 1.0*4096.0 + 7.0*65536.0;
	else if(n < 7.5) data = 4.0 + 4.0*16.0 + 4.0*256.0 + 4.0*4096.0 + 7.0*65536.0;
	else if(n < 8.5) data = 7.0 + 5.0*16.0 + 7.0*256.0 + 5.0*4096.0 + 7.0*65536.0;
	else if(n < 9.5) data = 7.0 + 4.0*16.0 + 7.0*256.0 + 5.0*4096.0 + 7.0*65536.0;
	
	vec2 vPixel = floor(vUV * vec2(4.0, 5.0));
	float fIndex = vPixel.x + (vPixel.y * 4.0);
	
	return mod(floor(data / pow(2.0, fIndex)), 2.0);
}

float PrintInt( in vec2 uv, in float value )
{
	float res = 0.0;
	float maxDigits = 1.0+ceil(.01+log2(value)/log2(10.0));
	float digitID = floor(uv.x);
	if( digitID>0.0 && digitID<maxDigits )
	{
        float digitVa = mod( floor( value/pow(10.0,maxDigits-1.0-digitID) ), 10.0 );
        res = SampleDigit( digitVa, vec2(fract(uv.x), uv.y) );
	}

	return res;	
}

//=================================================================================================
// all iq code below
//=================================================================================================

float map( vec3 p )
{
    p.xz *= 0.8;
    p.xyz += 1.000*sin(  2.0*p.yzx );
    p.xyz -= 0.500*sin(  4.0*p.yzx );
    float d = length( p.xyz ) - 1.5;
	return d * 0.25;
}


float intersect( in vec3 ro, in vec3 rd )
{
	const float maxd = 7.0;

	float precis = 0.001;
    float h = 1.0;
    float t = 1.0;
    for( int i=0; i<256; i++ )
    {
        if( (h<precis) || (t>maxd) ) break;
	    h = map( ro+rd*t );
        t += h;
    }

    if( t>maxd ) t=-1.0;
	return t;
}

vec3 calcNormal( in vec3 pos )
{
    // from Paul Malin (4 samples only in a tetrahedron	
    vec2 e = vec2(1.0,-1.0)*0.002;
    return normalize( e.xyy*map( pos + e.xyy ) + 
					  e.yyx*map( pos + e.yyx ) + 
					  e.yxy*map( pos + e.yxy ) + 
					  e.xxx*map( pos + e.xxx ) );
}

mat3 setCamera( in vec3 ro, in vec3 rt, in float cr )
{
	vec3 cw = normalize(rt-ro);
	vec3 cp = vec3(sin(cr), cos(cr),0.0);
	vec3 cu = normalize( cross(cw,cp) );
	vec3 cv = normalize( cross(cu,cw) );
    return mat3( cu, cv, -cw );
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 p = (-iResolution.xy+2.0*fragCoord.xy)/iResolution.y;
	vec2 q = fragCoord/iResolution.xy;
	
    //-----------------------------------------------------


    float ti = mod( 0.25*iTime, 8.0 );
    float am = clamp( ti/3.0, 0.0, 1.0 ) - clamp( (ti-4.0)/3.0, 0.0, 1.0 );
    uint precis = 1u + uint(floor(15.0*am));
    
    //-----------------------------------------------------
	
	float an = 4.0 + 0.1*iTime*2.0;
    
	vec3 ro = vec3(4.5*sin(an),2.0,4.5*cos(an));
    vec3 ta = vec3(0.0,0.0,0.0);
    mat3 ca = setCamera( ro, ta, 0.0 );
    vec3 rd = normalize( ca * vec3(p,-1.5) );

    //-----------------------------------------------------
    
	vec3 col = vec3(0.07)*clamp(1.0-length(q-0.5),0.0,1.0);

    float t = intersect(ro,rd);
    if( t>0.0 )
    {
        vec3 pos = ro + t*rd;
        vec3 nor = calcNormal(pos);
		vec3 ref = reflect( rd, nor );
        vec3 sor = nor;
        
        // compress normal
        uint id = octahedral_32( nor, precis );
        
        // decompress normal
        nor = i_octahedral_32( id, precis);
        
        nor = (p.x>0.0) ? nor : sor;

        // material
		col = vec3(0.2);
        col *= 1.0 + 0.5*nor;

        
		// lighting
        float sky = 0.5 + 0.5*nor.y;
        float fre = clamp( 1.0 + dot(nor,rd), 0.0, 1.0 );
        float spe = pow(max( dot(-rd,nor),0.0),32.0);
		// lights
		vec3 lin  = vec3(0.0);
		     lin += 3.0*vec3(0.7,0.80,1.00)*sky;
        	 lin += 8.0*vec3(0.7,0.8,1.00)*smoothstep(0.0,0.2,ref.y)*(0.1+0.9*pow(fre,5.0))*sky;
             lin += 1.0*fre*vec3(1.0,0.90,0.80);
        col = col * lin;
        col += 0.50*spe;
        col += 0.15*spe*spe*spe;
	}

	
	col = sqrt(col);
    
    col += PrintInt( (q-vec2(0.7,0.75))*12.0*vec2(1.0,iResolution.y/iResolution.x), float(2u*precis) );

    col *= smoothstep( 0.003,0.004,abs(q.x-0.5) );

    fragColor = vec4( col, 1.0 );
}
