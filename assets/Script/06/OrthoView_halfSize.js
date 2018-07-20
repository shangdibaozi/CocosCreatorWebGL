var VSHADER_SOURCE = 
`
attribute vec4 a_Position;
attribute vec4 a_Color;
uniform mat4 u_ProjMatrix;
varying vec4 v_Color;
void main() {
    gl_Position = u_ProjMatrix * a_Position;
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
        this.near = 0.0;
        this.far = 0.5;
        this.initProgram();
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
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
        var u_ProjMatrix = gl.getUniformLocation(program._programObj, 'u_ProjMatrix');

        var projMatrix = new Matrix4();
        // projMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, 0.0, 2.0);
        // gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);


        var vertexColorBuffer = gl.createBuffer();
        var n = this.initVertexBuffers(gl, vertexColorBuffer, a_Position, a_Color);


        var self = this;
        sgNode._renderCmd.rendering = function() {
            program.use();

            projMatrix.setOrtho(-0.5, 0.5, -0.5, 0.5, self.near, self.far);
            gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

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
    },

    onKeyDown : function(event) {
        switch(event.keyCode) {
            case cc.KEY.a:
                this.near += 0.01;
                break;
            case cc.KEY.d:
                this.near -= 0.01;
                break;
            case cc.KEY.w:
                this.far -= 0.01;
                break;
            case cc.KEY.s:
                this.far += 0.01;
                break;
        }
    }
});
