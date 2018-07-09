/**
 * 碎片特效主要原理：
 *     将一个整图分割成n个碎图，利用cc.SpriteBatchNode对这些碎图进行渲染。
 */
var Cfrag = _ccsg.Sprite.extend({
    ctor : function() {
        this._super();
        this.m_randomNumber = -1;
    }
});

var CShatterAction = cc.ActionInterval.extend({
    initMembers : function() {
        this.m_timeFoe = 0;
        this.m_timeCur = 0;
        this.m_growSpeedOfTargetR = 20;
    },

    initWithDuration : function(duration) {
        this._super(duration);
        this.initMembers();
        return true;
    },

    stop : function() {
        var pTarget = this.target.getComponent('Shatter');
        pTarget.m_fragBatchNode.setVisible(true);
        this._super();
    },

    startWithTarget : function(target) {
        var rTarget = target.getComponent('Shatter');
        rTarget.resetShatter();
        rTarget.m_fragBatchNode.setVisible(true);
        this._super(target);
    },

    update : function(time) {
        var pTarget = this.target.getComponent('Shatter');
        this.m_timeFoe = this.m_timeCur;
        var progressPercentage = time;
        this.m_timeCur = progressPercentage * this.getDuration();
        pTarget.updateShatterAction(this.m_timeCur, this.m_timeCur - this.m_timeFoe, this.m_growSpeedOfTargetR);
    },

    isDone : function() {
        return this._super();
    }
});

CShatterAction.create = function(fDuration) {
    var p = new CShatterAction();
    p.initWithDuration(fDuration);
    return p;
};


cc.Class({
    extends: cc.Component,

    properties: {
        fish : {
            default : null,
            type : cc.SpriteFrame
        }
    },

    onLoad : function() {
        this.texture = this.node.getComponent(cc.Sprite).spriteFrame.getTexture();

        this.m_gridSideLen = 3.0;
        this.m_initalFrageScale = 5.0;
        this.m_fragBatchNode = null;
        this.m_grid = [];

        this.createShatter();

        this.node.on('touchstart', this.touchstart, this);
    },

    touchstart : function() {
        if(this.node.getOpacity() === 0) {
            this.node.setOpacity(255);
        } else {
            this.node.setOpacity(0);
            this.node.stopAllActions();
            var shatterAction = CShatterAction.create(4);
            this.node.runAction(shatterAction);
        }
    },

    createShatter : function() {
        var contentSize = this.node.getContentSize();
        var nRow = contentSize.height / this.m_gridSideLen << 0;
        var nCol = contentSize.width / this.m_gridSideLen << 0;
        var fragCount = nRow * nCol;



        this.m_fragBatchNode = new cc.SpriteBatchNode(this.texture, fragCount);
        this.node._sgNode.addChild(this.m_fragBatchNode);
        this.m_fragBatchNode.setVisible(false);

        for(var i = 0; i < nRow; i++) {
            this.m_grid.push(new Array(nCol));
        }
        var halfGridSideLen = 0.5 * this.m_gridSideLen;
        for(var i = 0; i < nRow; i++) {
            for(var j = 0; j < nCol; j++) {
                var frag = new Cfrag();
                frag.initWithTexture(this.texture);
                this.m_grid[i][j] = frag;
                this.m_fragBatchNode.addChild(frag);
                frag.m_randomNumber = Math.random() * 0x7fff << 0;
            }
        }
    },

    resetShatter : function() {
        var contentSize = this.node.getContentSize();
        var nRow = this.m_grid.length;
        var nCol = this.m_grid[0].length;
        var halfGridSideLen = 0.5 * this.m_gridSideLen;
        for(var i = 0; i < nRow; i++) {
            for(var j = 0; j < nCol; j++) {
                var frag = this.m_grid[i][j];
                var x = j * this.m_gridSideLen + halfGridSideLen;
                var y = contentSize.height - (i * this.m_gridSideLen + halfGridSideLen);
                frag.setTextureRect(cc.rect(
                    x - halfGridSideLen, 
                    (contentSize.height - y) - halfGridSideLen, 
                    this.m_gridSideLen, 
                    this.m_gridSideLen));
                frag.setPosition(x, y);
                frag.setScale(this.m_initalFrageScale);
                frag.setOpacity(255);
                frag.setVisible(true);
            }
        }
    },

    updateShatterAction : function(time, dt, growSpeedOfTargetR) {
        var contentSize = this.node.getContentSize();
        var center = cc.p(contentSize.width / 2, contentSize.height / 2);
        var initalTargetR = cc.pLength(cc.p(contentSize.width, contentSize.height)) / 2;
        var nRow = this.m_grid.length;
        var nCol = this.m_grid[0].length;
        for(var i = 0; i < nRow; i++) {
            for(var j = 0; j < nCol; j++) {
                var frag = this.m_grid[i][j];
                if(frag.getOpacity() === 0 || frag.getScale() === 0) {
                    frag.setVisible(false);
                    continue;
                }
                var targetR = initalTargetR + time * growSpeedOfTargetR;
                var fragPos = frag.getPosition();
                var disToCenter = cc.pLength(fragPos.sub(center));
                var dir;
                if(disToCenter === 0) {
                    dir = cc.p(0, 0);
                } else {
                    dir = fragPos.sub(center);
                    dir.x /= disToCenter;
                    dir.y /= disToCenter;
                }
                var disToEdge = targetR - disToCenter;
                var disToEdgeWithRandom = disToEdge + frag.m_randomNumber % (initalTargetR << 0) - initalTargetR / 2;
                var movLen = disToEdgeWithRandom * 0.0333;
                var moveVec = cc.pMult(dir, movLen);
                frag.setPosition(fragPos.add(moveVec));
                var opacity = Math.max(0, 255 - 255 * disToCenter / initalTargetR);
                frag.setOpacity(opacity);
                frag.setScale(Math.max(0, this.m_initalFrageScale - this.m_initalFrageScale * disToCenter / initalTargetR));
            }
        }
    }
});
