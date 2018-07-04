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

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;
void main() {
    float d = distance(v_texCoord, vec2(0.5, 0.5));
    if(d < 0.3) { // 判断距离，如果小于0.3就绘制
        gl_FragColor = texture2D(CC_Texture0, v_texCoord);
    } else {
        discard;
    }
}
`;


cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onLoad : function() {
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


        var sgNode = this.node.getComponent(cc.Sprite)._sgNode;
        sgNode.setShaderProgram(program);
    }
});
