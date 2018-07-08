var VSHADER_SOURCE = 
`
attribute vec4 a_Position;
attribute vec4 a_Color;
varying vec4 v_Color;
void main() {
	gl_Position = a_Position;
	gl_PointSize = 10.0;
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
	extends : cc.Component,

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
		var vertexColorBuffer = gl.createBuffer();
		var n = this.initVertexBuffers(gl, vertexColorBuffer, a_Position, a_Color, program._programObj);

		sgNode._renderCmd.rendering = function() {
			program.use();
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);

			gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 5, 0);
			gl.enableVertexAttribArray(a_Position);

			gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 5, 2 * Float32Array.BYTES_PER_ELEMENT);
			gl.enableVertexAttribArray(a_Color);

			gl.drawArrays(gl.POINTS, 0, n);
			cc.incrementGLDraws(1);
		};
	},

	initVertexBuffers : function(gl, vertexColorBuffer, a_Position, a_Color, program) {
		var verticesColor = new Float32Array([
			0.0, 0.5, 1.0, 0.0, 0.0,
			-0.5, -0.5, 0.0, 1.0, 0.0,
			0.5, -0.5, 0.0, 0.0, 1.0
			]);
		var n = 3;

		gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, verticesColor, gl.STATIC_DRAW);

		var FSIZE = verticesColor.BYTES_PER_ELEMENT;
		gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
		gl.enableVertexAttribArray(a_Position);

		gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, 2 * FSIZE);
		gl.enableVertexAttribArray(a_Color);

		return n;
	}
});