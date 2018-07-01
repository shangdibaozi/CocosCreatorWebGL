var VSHADER_SOURCE = 
`
attribute vec4 a_Position;
uniform float u_CosB, u_SinB;
void main() {
    gl_Position.x = a_Position.x * u_CosB - a_Position.y * u_SinB;
    gl_Position.y = a_Position.x * u_SinB + a_Position.y * u_CosB;
    gl_Position.z = a_Position.z;
    gl_Position.w = 1.0;
}
`;

var FSHADER_SOURCE = 
`
void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`;

// The rotation angle
var ANGLE = 90.0;

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
        program.use(); // WebGL: INVALID_OPERATION: uniform1f: location not for current program

        // Create a buffer object
        var vertexBuffer = gl.createBuffer();
        var n = this.initVertexBuffers(gl, vertexBuffer, program._programObj);
        if(n < 0) {
            cc.error('Failed to set the positions of the vertices');
            return;
        }

        // Pass the data required to rotate the shape to the vertex shader
        var radian = Math.PI * ANGLE / 180.0; // Convert to radians
        var cosB = Math.cos(radian);
        var sinB = Math.sin(radian);

        var u_CosB = gl.getUniformLocation(program._programObj, 'u_CosB');
        var u_SinB = gl.getUniformLocation(program._programObj, 'u_SinB');
        if(!u_CosB || !u_SinB) {
            cc.error('Failed to get the storate location of u_CosB or u_SinB');
            return;
        }
        gl.uniform1f(u_CosB, cosB);
        gl.uniform1f(u_SinB, sinB);

        sgNode._renderCmd.rendering = function() {
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

        var a_Position = gl.getAttribLocation(program, 'a_Position');
        if(a_Position < 0) {
            cc.error('Failed to get the storage location of a_Position');
            return -1;
        }
        // Assign the buffer object to a_Position variable
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

        // Enable the assignment to a_Position variable
        gl.enableVertexAttribArray(a_Position);

        return n;
    }
});
