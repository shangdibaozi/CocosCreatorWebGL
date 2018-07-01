
var VSHADER_SOURCE = 
`
precision mediump float;
attribute vec4 a_Position;void main() {
    gl_Position = a_Position;
    gl_PointSize = 10.0;
}
`;

var FSHADER_SOURCE = 
`
precision mediump float;
uniform vec4 u_FragColor;
void main() {
    gl_FragColor = u_FragColor;
}
`;


cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onLoad : function() {
        this.points = [];
        this.colors = [];
        this.initProgram();

        this.node.on('touchstart', this.touchstart, this);
    },

    initProgram : function() {
        var wnode = new _ccsg.Node();
        this.node._sgNode.addChild(wnode);
        wnode._renderCmd._needDraw = true; // 见RendererWebGL的rendering方法

        
        var program = new cc.GLProgram();
        var gl = program._glContext;
        program.initWithVertexShaderByteArray(VSHADER_SOURCE, FSHADER_SOURCE);
        program.link();
        wnode.setShaderProgram(program);
        
        var a_Position = gl.getAttribLocation(program._programObj, 'a_Position');
        var u_FragColor = gl.getUniformLocation(program._programObj, 'u_FragColor');

        if(!u_FragColor) {
            cc.log('Failed to get the storage location of u_FragColor');
        //     // return;
        }
        // u_FragColor = 0;//u_FragColor.sourceProgram.uniformInfos[0];
        var self = this;
        // 必须要有rendering，这样渲染命名才会被加入到cc.renderer._renderCmds
        // rendering是在每一帧由系统调用
        wnode._renderCmd.rendering = function() {
            var len = self.points.length;
            if(len === 0) {
                return;
            }
            program.use();
            var xy;
            var rgba;
            for(var i = 0; i < len; i ++) {
                xy = self.points[i];
                rgba = self.colors[i];
                gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
                gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
                gl.drawArrays(gl.POINT, 0, 1);
            }
            cc.incrementGLDraws(1);
        };
    },

    touchstart : function(event) {
        cc.log('touchstart', event.getLocation());
        var pos = event.getLocation();
        var x = pos.x;
        var y = pos.y;
        x = (x - 960 / 2) / (960 / 2);
        y = (y - 640 / 2) / (640 / 2);
        this.points.push([x, y]);

        if(x >= 0.0 && y >= 0.0) {
            this.colors.push([1.0, 0.0, 0.0, 1.0]); // red
        } else if(x < 0.0 && y < 0.0) {
            this.colors.push([0.0, 1.0, 0.0, 1.0]); // green
        } else {
            this.colors.push([1.0, 1.0, 1.0, 1.0]); // white
        }
    }
});
