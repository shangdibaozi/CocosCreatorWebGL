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
#ifdef GL_ES
precision lowp float;
#endif

uniform float time;
uniform sampler2D u_lightTexture;
uniform vec4 u_LightColor; // 波光颜色
uniform vec2 u_animLight;
uniform vec4 u_suv;


varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

void mainImage(out vec4 fragColor) {
    vec2 uv = v_texCoord;
    vec2 luv = vec2((uv.x - u_suv[0]) / u_suv[2], (uv.y - u_suv[1]) / u_suv[3]);
    vec4 randValue = texture2D(u_lightTexture, luv + u_animLight.xy);

    vec4 tex = texture2D(CC_Texture0, v_texCoord);

    float alpha = tex[3];
    tex[0] = tex[0] + randValue[0] * alpha;
    tex[1] = tex[1] + randValue[1] * alpha;
    tex[2] = tex[2] + randValue[2] * alpha;
    
    fragColor = v_fragmentColor * tex;;

    // vec4 lightColor = texture2D(u_lightTexture, v_texCoord + u_animLight.xy) * u_LightColor;
    // fragColor = texture2D(CC_Texture0, v_texCoord) * lightColor;
}

void main() {
    mainImage(gl_FragColor);
}
`;


cc.Class({
    extends: cc.Component,

    properties: {
        noiseTexture : {
            default : null,
            type : cc.SpriteFrame
        }
    },

    onLoad : function() {
        this.lightAni = {x : 0, y : 0};
        this.program = null;
        this.startTime = Date.now();
        this.time = 0;
        // this.enabled = false; // 加载组件后不马上执行update方法

        this.onDissolve();
    },

    onDissolve : function() {
    
        var program = this.program = new cc.GLProgram();
        program.initWithVertexShaderByteArray(VSHADER_SOURCE, FSHADER_SOURCE);
        program.addAttribute(cc.macro.ATTRIBUTE_NAME_POSITION, cc.macro.VERTEX_ATTRIB_POSITION);
        program.addAttribute(cc.macro.ATTRIBUTE_NAME_COLOR, cc.macro.VERTEX_ATTRIB_COLOR);
        program.addAttribute(cc.macro.ATTRIBUTE_NAME_TEX_COORD, cc.macro.VERTEX_ATTRIB_TEX_COORDS);

        program.link();
        program.updateUniforms();
        program.use();

        var gl = cc._renderContext;

        var lightTexture = this.noiseTexture.getTexture();
        lightTexture.setTexParameters({wrapS: cc.Texture2D.WrapMode.REPEAT, wrapT: cc.Texture2D.WrapMode.REPEAT});
        var glTex1 = lightTexture._glID;
        this.lightTexture = lightTexture;
        cc.gl.bindTexture2DN(1, lightTexture);

        var ba = program.getUniformLocationForName('time');
        program.setUniformLocationWith1f(ba, this.time);

        var tex1 = program.getUniformLocationForName('u_lightTexture');
        program.setUniformLocationWith1i(tex1, 1);


        var u_LightColor = program.getUniformLocationForName('u_LightColor');
        program.setUniformLocationWith4f(u_LightColor, 1.0, 1.0, 1.0, 1.0);

        var u_animLight = program.getUniformLocationForName('u_animLight');
        this.u_animLight = u_animLight;

        var sprite = this.node.getComponent(cc.Sprite);
        var rect = sprite.spriteFrame.getRect();
        var texture = sprite.spriteFrame.getTexture();
        cc.log(rect);
        var u = rect.x / texture.width;
        var v = rect.y / texture.height;
        var w = rect.width / texture.width;
        var h = rect.height / texture.height;
        cc.log(u, v);

        var u_suv = program.getUniformLocationForName('u_suv');
        program.setUniformLocationWith4f(u_suv, u, v, w, h);

        var sgNode = sprite._sgNode;
        sgNode.setShaderProgram(program);
    },

    update : function(dt) {
        this.time += 0.004;
        if(this.program) {
            this.program.use();
            var ct = this.program.getUniformLocationForName('time');
            this.program.setUniformLocationWith1f(ct, this.time);

            this.lightAni.x += 0.002;
            if(this.lightAni.x > 1.0) {
                this.lightAni.x -= 1.0;
            }
            this.lightAni.y += 0.002;
            if(this.lightAni.y > 1.0) {
                this.lightAni.y -= 1.0;
            }
            this.program.setUniformLocationWith2f(this.u_animLight, this.lightAni.x, this.lightAni.y);
        }
    }
});
