
var VSHADER_SOURCE = 
`
attribute vec4 a_Position;
void main() {
    gl_Position = a_Position;
    gl_PointSize = 10.0;
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
        this.points = [];
        this.initProgram();

        this.node.on('touchstart', this.touchstart, this);
    },

    initProgram : function() {
        var wnode = new _ccsg.Node();
        this.node._sgNode.addChild(wnode);
        wnode._renderCmd._needDraw = true; // 见RendererWebGL的rendering方法

        
        var program = new cc.GLProgram();
        var gl = cc._renderContext;
        program.initWithVertexShaderByteArray(VSHADER_SOURCE, FSHADER_SOURCE);
        program.link();
        wnode.setShaderProgram(program);
        
        var a_position = gl.getAttribLocation(program._programObj, 'a_Position');

        var self = this;
        // 必须要有rendering，这样渲染命名才会被加入到cc.renderer._renderCmds
        // rendering是在每一帧由系统调用
        wnode._renderCmd.rendering = function() {
            var len = self.points.length;
            if(len === 0) {
                return;
            }
            program.use();
            for(var i = 0; i < len; i += 2) {
                gl.vertexAttrib3f(a_position, self.points[i], self.points[i + 1], 0.0);
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
        this.points.push(x);
        this.points.push(y);
    }
});
