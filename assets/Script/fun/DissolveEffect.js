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
uniform sampler2D texture1;

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = v_texCoord;
    float randValue = texture2D(texture1, uv).b;

    if(randValue < time) {
        discard; // discard，它只能在片元着色器中使用，表示放弃当前片元直接处理下一个片元
    }

    vec4 color = v_fragmentColor * texture2D(CC_Texture0, uv);
    if(randValue < time + 0.04) {
        color = vec4(0.9, 0.6, 0.3, color.a);
    }
    fragColor = color;
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
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
        this.program = null;
        this.startTime = Date.now();
        this.time = 0;
        this.enabled = false; // 加载组件后不马上执行update方法
    },

    onDissolve : function() {
        var texture1 = this.noiseTexture.getTexture();
        var glTex1 = texture1._glID;
        cc.gl.bindTexture2DN(1, texture1);

        var program = this.program = new cc.GLProgram();
        program.initWithVertexShaderByteArray(VSHADER_SOURCE, FSHADER_SOURCE);
        program.addAttribute(cc.macro.ATTRIBUTE_NAME_POSITION, cc.macro.VERTEX_ATTRIB_POSITION);
        program.addAttribute(cc.macro.ATTRIBUTE_NAME_COLOR, cc.macro.VERTEX_ATTRIB_COLOR);
        program.addAttribute(cc.macro.ATTRIBUTE_NAME_TEX_COORD, cc.macro.VERTEX_ATTRIB_TEX_COORDS);

        program.link();
        program.updateUniforms();
        program.use();

        var ba = program.getUniformLocationForName('time');
        var tex1 = program.getUniformLocationForName('texture1');
        program.setUniformLocationWith1f(ba, this.time);
        program.setUniformLocationWith1i(tex1, 1);

        var sgNode = this.node.getComponent(cc.Sprite)._sgNode;
        sgNode.setShaderProgram(program);
        this.enabled = true; // 可以执行update方法了
    },

    update : function(dt) {
        this.time += 0.004;
        if(this.program) {
            this.program.use();
            var ct = this.program.getUniformLocationForName('time');
            this.program.setUniformLocationWith1f(ct, this.time);
        }
    }
});
