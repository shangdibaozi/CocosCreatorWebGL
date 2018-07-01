
var VSHADER_SOURCE = 
`
attribute vec4 a_position;
void main() {
    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
    gl_PointSize = 10.0;
}
`;

var FSHADER_SOURCE = 
`
void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;


cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onLoad : function() {
        var wnode = new _ccsg.Node();
        this.node._sgNode.addChild(wnode);
        wnode._renderCmd._needDraw = true;


        var program = new cc.GLProgram();
        var gl = program._glContext;
        program.initWithVertexShaderByteArray(VSHADER_SOURCE, FSHADER_SOURCE);
        program.link();
        wnode.setShaderProgram(program);

        // 必须要有rendering，这样渲染命名才会被加入到cc.renderer._renderCmds
        wnode._renderCmd.rendering = function() {
            program.use();
            gl.drawArrays(gl.POINT, 0, 1);
            cc.incrementGLDraws(1);
        };

    }
});
