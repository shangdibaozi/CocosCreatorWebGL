var VSHADER_SOURCE = 
`
attribute vec4 a_Position;
attribute vec4 a_Color;
uniform mat4 u_ViewMatrix;
varying vec4 v_Color;
void main() {
    gl_Position = u_ViewMatrix * a_Position;
    v_Color = a_Color;
}
`;

var FSHADER_SOURCE = 
`
#ifdef GL_ES
precision mediump float;
#endif
varying vec4 v_Color;
void main() {
    gl_FragColor = v_Color;
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
        var a_Color = gl.getAttribLocation(program._programObj, 'a_Color');
        var u_ViewMatrix = gl.getUniformLocation(program._programObj, 'u_ViewMatrix');

        var viewMatrix = new Matrix4();
        // viewMatrix.setLookAt(0.20, 0.25, 0.25, 0, 0, 0, 0, 1, 0);
        viewMatrix.setLookAt(0.0, 0.0, 0.010, 0, 0, 0, 0, 1, 0);
        gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

        var vertexColorBuffer = gl.createBuffer();
        var n = this.initVertexBuffers(gl, vertexColorBuffer, a_Position, a_Color);


        sgNode._renderCmd.rendering = function() {
            program.use();

            gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
            gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 6, 0);
            gl.enableVertexAttribArray(a_Position);
            gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 6, Float32Array.BYTES_PER_ELEMENT * 3);
            gl.enableVertexAttribArray(a_Color);

            gl.drawArrays(gl.TRIANGLES, 0, n);
            cc.incrementGLDraws(1);

        };
    },

    initVertexBuffers : function(gl, vertexColorBuffer ,a_Position, a_Color) {
        var verticesColors = new Float32Array([
             0.0,  0.5, -0.4, 0.4, 1.0, 0.4,
            -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,
             0.5, -0.5, -0.4, 1.0, 0.4, 0.4,

             0.5,  0.4, -0.2, 1.0, 0.4, 0.4,
            -0.5,  0.4, -0.2, 1.0, 1.0, 0.4,
             0.0, -0.6, -0.2, 1.0, 1.0, 0.4,

             0.0,  0.3,  0.0, 0.4, 0.4, 1.0,
            -0.6, -0.4,  0.0, 0.4, 0.4, 1.0,
             0.6, -0.4,  0.0, 1.0, 0.4, 0.4
        ]);
        var n = 9;

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

        var FSIZE = verticesColors.BYTES_PER_ELEMENT;
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
        gl.enableVertexAttribArray(a_Color);

        return n;
    }
});
