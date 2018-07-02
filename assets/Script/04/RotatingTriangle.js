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

// Rotation angle (degrees/second)
var ANGLE_STEP = 45.0;
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

        // Get storage location of u_ModelMatrix
        var u_ModelMatrix = gl.getUniformLocation(program._programObj, 'u_ModelMatrix');
        if(!u_ModelMatrix) {
            cc.error('Failed to get the storage location of u_ModelMatrix');
            return;
        }

        // Current rotation angle
        var currentAngle = 0.0;
        // Model matrix
        var modelMatrix = new Matrix4();
        var g_last = Date.now();

        sgNode._renderCmd.rendering = function() {
            var now = Date.now();
            var elapsed = now - g_last;
            g_last = now;
            var newAngle = currentAngle + (ANGLE_STEP * elapsed) / 1000.0;
            currentAngle = newAngle % 360;

            modelMatrix.setRotate(currentAngle, 0, 0, 1);
            gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

            program.use();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.drawArrays(gl.TRIANGLES, 0, n);
            cc.incrementGLDraws(1);
        };
    },

    initVertexBuffers : function(gl, vertexBuffer, program) {
        var vertices = new Float32Array([
            0, 0.5,
            -0.5, -0.5,
            0.5, -0.5
            ]);
        var n = 3; // The number of vertices

        
        // Bind the buffer object to target
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        // Write data into the buffer object
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        // Assign the buffer object to a_Position variable
        var a_Position = gl.getAttribLocation(program, 'a_Position');
        if(a_Position < 0) {
            cc.error('Failed to get the storage location of a_Position');
            return -1;
        }        
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);

        return n;
    }
});
