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
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
varying vec2 v_TexCoord;

void main() {
    vec4 color0 = texture2D(u_Sampler0, v_TexCoord);
    vec4 color1 = texture2D(u_Sampler1, v_TexCoord);
    gl_FragColor = color0 * color1;
}
`;


cc.Class({
    extends: cc.Component,

    properties : {
        texture0 : {
            default : null,
            type : cc.SpriteFrame
        },
        texture1 : {
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
        var u_Sampler0 = gl.getUniformLocation(program._programObj, 'u_Sampler0');
        var u_Sampler1 = gl.getUniformLocation(program._programObj, 'u_Sampler1');

        var vertexTexCoordBuffer = gl.createBuffer();
        var texture0 = gl.createTexture();
        var texture1 = gl.createTexture();
        var n = this.initVertexBuffers(gl, program._programObj, a_Position, a_TexCoord, vertexTexCoordBuffer);

        var imgTexture0 = this.texture0.getTexture();
        var imgTexture1 = this.texture1.getTexture();
        // cc.gl.bindTexture2DN(1, imgTexture0);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y-axis
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgTexture0._image);
        gl.uniform1i(u_Sampler0, 0);// Pass the texure unit to u_Sampler

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y-axis
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texture1);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgTexture1._image);
        gl.uniform1i(u_Sampler1, 1);// Pass the texure unit to u_Sampler

        sgNode._renderCmd.rendering = function() {
            program.use();

            gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
            gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, 0);
            gl.enableVertexAttribArray(a_Position);

            gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 4, Float32Array.BYTES_PER_ELEMENT * 2);
            gl.enableVertexAttribArray(a_TexCoord);

            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y-axis
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture0);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y-axis
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, texture1);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

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