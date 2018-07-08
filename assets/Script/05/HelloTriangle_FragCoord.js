var VSHADER_SOURCE = 
`
attribute vec4 a_Position;
void main() {
    gl_Position = a_Position;
}
`;

var FSHADER_SOURCE = 
`
precision mediump float;
uniform float u_Width;
uniform float u_Height;
void main() { 
    gl_FragColor = vec4(gl_FragCoord.x / u_Width, 0.0, gl_FragCoord.y / u_Height, 1.0);
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
        var sgNode = new _ccsg.Node();
        this.node._sgNode.addChild(sgNode);
        sgNode._renderCmd._needDraw = true;

        var gl = cc._renderContext;
        var program = new cc.GLProgram();
        program.initWithVertexShaderByteArray(VSHADER_SOURCE, FSHADER_SOURCE);
        program.link();
        program.use();

        sgNode.setShaderProgram(program);

        var a_Position = gl.getAttribLocation(program._programObj, 'a_Position');

        var vertexBuffer = gl.createBuffer();
        var n = this.initVertexBuffers(gl, vertexBuffer, program._programObj, a_Position);

        sgNode._renderCmd.rendering = function() {
            program.use();

            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

            gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Position);

            gl.drawArrays(gl.TRIANGLES, 0, n);
            cc.incrementGLDraws(1);
        };
    },

    initVertexBuffers : function(gl, vertexBuffer, program, a_Position) {
        var vertices = new Float32Array([
            0.0, 1.0, 
            -1.0, -1.0, 
            1.0, -1.0, 
        ]);
        var n = 3;

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);


        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        var u_Width = gl.getUniformLocation(program, 'u_Width');
        gl.uniform1f(u_Width, 600);

        var u_Height = gl.getUniformLocation(program, 'u_Height');
        gl.uniform1f(u_Height, 600);

        return n;
    }
});
