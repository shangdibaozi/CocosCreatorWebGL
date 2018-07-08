
var VSHADER_SOURCE = 
`
attribute vec4 a_Position;
attribute float a_PointSize;
void main() {
    gl_Position = a_Position;
    gl_PointSize = a_PointSize;
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
        var a_PointSize = gl.getAttribLocation(program._programObj, 'a_PointSize');

        var vertexSizeBuffer = gl.createBuffer();

        var n = this.initVertexBuffers(gl, program._programObj, a_Position, a_PointSize, vertexSizeBuffer);

        sgNode._renderCmd.rendering = function() {
            program.use();

            gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer);
            gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
            gl.enableVertexAttribArray(a_Position);

            gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, Float32Array.BYTES_PER_ELEMENT * 2);
            gl.enableVertexAttribArray(a_PointSize);

            gl.drawArrays(gl.POINTS, 0, n);
            cc.incrementGLDraws(1);
        };
    },

    initVertexBuffers : function(gl, program, a_Position, a_PointSize, vertexSizeBuffer) {
        var verticesSizes = new Float32Array([
            0.0, 0.5, 40.0,
            -0.5, -0.5, 20.0,
            0.5, -0.5, 30.0
            ]);
        var n = 3;

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, verticesSizes, gl.STATIC_DRAW);

        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.vertexAttribPointer(a_PointSize, 1, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, Float32Array.BYTES_PER_ELEMENT * 2);
        gl.enableVertexAttribArray(a_PointSize);

        return n;
    }
});
