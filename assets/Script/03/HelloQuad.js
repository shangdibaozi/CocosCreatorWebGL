
var VSHADER_SOURCE = 
`
attribute vec4 a_Position;
void main() {
    gl_Position = a_Position;
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
        this.initProgram();
    },

    initProgram : function() {
        var wnode = new _ccsg.Node();
        this.node._sgNode.addChild(wnode);
        wnode._renderCmd._needDraw = true; // 见RendererWebGL的rendering方法

        
        var program = new cc.GLProgram();
        var gl = cc._renderContext;
        program.initWithVertexShaderByteArray(VSHADER_SOURCE, FSHADER_SOURCE);
        program.link();
        wnode.setShaderProgram(program);
        
        var vertices = new Float32Array([
            -0.5, 0.5,   
            -0.5, -0.5,   
            0.5, 0.5,　
            0.5, -0.5]);
        var n = 4;
        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        var a_Position = gl.getAttribLocation(program._programObj, 'a_Position');
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        var self = this;
        // 必须要有rendering，这样渲染命名才会被加入到cc.renderer._renderCmds
        // rendering是在每一帧由系统调用
        wnode._renderCmd.rendering = function() {
            program.use();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Position);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
            cc.incrementGLDraws(1);
        };
    }
});
