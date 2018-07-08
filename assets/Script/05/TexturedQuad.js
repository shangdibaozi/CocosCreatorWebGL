var VSHADER_SOURCE = 
`
attribute vec4 a_Position;
attribute vec2 a_TexCoord;
varying vec2 v_TexCoord;

void main() {
    gl_Position = a_Position;
    v_TexCoord = a_TexCoord;
}
`;

var FSHADER_SOURCE = 
`
#ifdef GL_ES 
precision mediump float;
#endif
uniform sampler2D u_Sampler;
varying vec2 v_TexCoord;

void main() {
    gl_FragColor = texture2D(u_Sampler, v_TexCoord);
}
`;


cc.Class({
    extends: cc.Component,

    properties : {
        sky : {
            default : null,
            type : cc.SpriteFrame
        }
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
        var a_TexCoord = gl.getAttribLocation(program._programObj, 'a_TexCoord');
        var u_Sampler = gl.getUniformLocation(program._programObj, 'u_Sampler');

        var vertexTexCoordBuffer = gl.createBuffer();
        var n = this.initVertexBuffers(gl, program._programObj, a_Position, a_TexCoord, vertexTexCoordBuffer);


        var texture = gl.createTexture();

        var skyTexture = this.sky.getTexture();
        var texUnit = 0;

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y-axis
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, skyTexture._image);
        gl.uniform1i(u_Sampler, texUnit);// Pass the texure unit to u_Sampler

        sgNode._renderCmd.rendering = function() {
            program.use();

            gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
            gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0);
            gl.enableVertexAttribArray(a_Position);

            gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, Float32Array.BYTES_PER_ELEMENT * 2);
            gl.enableVertexAttribArray(a_TexCoord);

            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y-axis
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.uniform1i(u_Sampler, texUnit);// Pass the texure unit to u_Sampler

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
            cc.incrementGLDraws(1);
        };
    },

    initVertexBuffers : function(gl, program, a_Position, a_TexCoord, vertexTexCoordBuffer) {
        var verticesTexCoords = new Float32Array([
            -0.5, 0.5, 0.0, 1.0,
            -0.5, -0.5, 0.0, 0.0,
            0.5, 0.5, 1.0, 1.0,
            0.5, -0.5, 1.0, 0.0
            ]);
        var n = 4;
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

        var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
        gl.enableVertexAttribArray(a_TexCoord);

        return n;
    }
});