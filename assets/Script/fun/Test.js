var VSHADER_SOURCE = 
`
attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec4 a_color;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

void main() {
    gl_Position = CC_PMatrix * a_position;
    v_fragmentColor = a_color;
    v_texCoord = a_texCoord;
}
`;

var FSHADER_SOURCE = 
`
#define TAU 6.120470874064187
#define MAX_ITER 5
uniform float time; 
varying vec2 v_texCoord;
varying vec4 v_fragmentColor;
void mainImage(out vec4 fragColor) 
{
    float time = time * .5+5.;

    vec2 uv = v_texCoord.xy;
    

    vec2 p = mod(uv * TAU, TAU) - 250.0;

    vec2 i = vec2(p);
    float c = 1.0;
    float inten = 0.0045;

    float speed = 20.0;

    for (int n = 0; n < MAX_ITER; n++) 
    {
        float t =  time * (1.0 - (speed / float(n + 1)));
        i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(1.5 * t + i.x));
        c += 1.0/length(vec2(p.x / (cos(i.x+t)/inten), p.y / (cos(i.y+t)/inten)));
    }
    c /= float(MAX_ITER);
    c = 1.17 - pow(c, 1.4);

    vec4 tex = texture2D(CC_Texture0, uv);
    vec3 colour = vec3(pow(abs(c), 15.0));
    // vec3 colour = vec3(pow(c, 15.0));
    // colour = clamp(colour, 0.0, tex.a * 2.0);

    // 混合波光
    // float alpha = c * tex[3];  
    float alpha = tex[3];  
    tex[0] = tex[0] + colour[0] * alpha; 
    tex[1] = tex[1] + colour[1] * alpha; 
    tex[2] = tex[2] + colour[2] * alpha; 

    fragColor = v_fragmentColor * tex;
}

void test(out vec4 fragColor) {
    vec2 uv = v_texCoord.xy;

    float x = sin(time + uv.x * 10.0);
    float y = sin(time + uv.y * 10.0);
    float a = cos(time + uv.x * uv.y * 10.0);

    vec2 offset = vec2(x, y) * 0.01;
    // float re = sin(st + uv.x) + cos(st + uv.y);

    vec2 re = uv + offset;

    vec4 tex = texture2D(CC_Texture0, re);
    vec3 colour = vec3(pow(uv.x * uv.y, 15.0));
    colour = clamp(colour, 0.0, tex.a);

    // // 混合波光
    float alpha = a * tex[3];  
    tex[0] = tex[0] + colour[0] * alpha; 
    tex[1] = tex[1] + colour[1] * alpha; 
    tex[2] = tex[2] + colour[2] * alpha; 

    fragColor = v_fragmentColor * tex;
}

void main()
{
    mainImage(gl_FragColor);
}
`;


cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onLoad : function() {
        this.time = 0;
        this.initProgram();
    },

    initProgram : function() {
        var program = new cc.GLProgram();
        program.initWithVertexShaderByteArray(VSHADER_SOURCE, FSHADER_SOURCE);
        program.addAttribute(cc.macro.ATTRIBUTE_NAME_POSITION, cc.macro.VERTEX_ATTRIB_POSITION);
        program.addAttribute(cc.macro.ATTRIBUTE_NAME_COLOR, cc.macro.VERTEX_ATTRIB_COLOR);
        program.addAttribute(cc.macro.ATTRIBUTE_NAME_TEX_COORD, cc.macro.VERTEX_ATTRIB_TEX_COORDS);

        program.link();
        program.updateUniforms();
        program.use();
        this.program = program;

        this.u_time = program.getUniformLocationForName('time');

        var sprite = this.node.getComponent(cc.Sprite);
        var rect = sprite.spriteFrame.getRect();
        var texture = sprite.spriteFrame.getTexture();
        cc.log(rect);
        if(texture.width > 0 && texture.height > 0) {
            var u = rect.x / texture.width;
            var v = (rect.y + rect.height) / texture.height;
            cc.log(u, v);
        }

        var sgNode = sprite._sgNode;
        sgNode.setShaderProgram(program);
    },

    update : function(dt) {
        this.time += 0.014;
        if(this.program) {
            this.program.use();
            this.program.setUniformLocationWith1f(this.u_time, this.time);
        }

        if(this.time > 1000) {
            this.time = 0;
        }
    }
});
