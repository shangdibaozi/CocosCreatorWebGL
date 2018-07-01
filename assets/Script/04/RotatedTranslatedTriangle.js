var VSHADER_SOURCE = 
`
attribute vec4 a_Position;
uniform mat4 u_ModelMatrix;
void main() {
    gl_Position = u_ModelMatrix * a_Position;
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

        // Create Matrix4 object for model transformation
        var modelMatrix = new Matrix4();
        // Calculate a model matrix
        var ANGLE = 0.0;   // The rotation angle
        var Tx = 0.5;       // Translation distance
        // 先平移再旋转
        modelMatrix.setRotate(ANGLE, 0, 0, 1); // Set rotation matrix
        modelMatrix.translate(Tx, 0.0, 0);         // Multiply modelMatrix by the calculated translation matrix

        // Pass the model matrix to the vertex shader
        var u_ModelMatrix = gl.getUniformLocation(program._programObj, 'u_ModelMatrix');
        if(!u_ModelMatrix) {
            cc.error('Failed to get the storage location of u_ModelMatrix');
            return;
        }
        gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

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
