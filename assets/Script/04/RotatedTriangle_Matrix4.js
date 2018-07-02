var VSHADER_SOURCE = 
`
attribute vec4 a_Position;
uniform mat4 u_xformMatrix;
void main() {
    gl_Position = u_xformMatrix * a_Position;
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
        var sgNode = new _ccsg.Node();
        this.node._sgNode.addChild(sgNode);
        sgNode._renderCmd._needDraw = true;

        var gl = cc._renderContext;
        var program = new cc.GLProgram();
        program.initWithVertexShaderByteArray(VSHADER_SOURCE, FSHADER_SOURCE);
        program.link();
        sgNode.setShaderProgram(program);
        program.use();

        var vertexBuffer = gl.createBuffer();
        var n = this.initVertexBuffers(gl, vertexBuffer, program._programObj);
        if(n < 0) {
            cc.error('Failed to set the position of the vertices');
            return;
        }

        // Create Matrix4 object for the rotation matrix
        var xformMatrix = new Matrix4();
        // Set the rotation matrix
        var ANGLE = 30.0; // The rotation angle
        xformMatrix.setRotate(ANGLE, 0, 0, 1);

        // Pass the model matrix to the vertex shader
        var u_xformMatrix = gl.getUniformLocation(program._programObj, 'u_xformMatrix');
        if(!u_xformMatrix) {
            cc.error('Failed to get the storage location of u_xformMatrix');
            return;
        }
        gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix.elements);

        sgNode._renderCmd.rendering = function() {
            program.use();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.drawArrays(gl.TRIANGLES, 0, n);
            cc.incrementGLDraws(1);
        };
    },

    initVertexBuffers : function(gl, vertexBuffer, program) {
        var vertices = new Float32Array([
                0, 0.7,
                -0.3, -0.3,
                0.3, -0.3
            ]);

        var n = 3;

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        var a_Position = gl.getAttribLocation(program, 'a_Position');
        if(a_Position < 0) {
            cc.error('Failed to get the storage location of a_Position');
            return -1;
        }

        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        return n;
    }
});
