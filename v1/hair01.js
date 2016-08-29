var Point = function(pX, pY) {
    this.x = pX || 0;
    this.y = pY || 0;
    this.set = function(pX, pY) {
        this.x = pX;
        this.y = pY;
    };
    this.add = function(pP) {
        return new Point(this.x + pP.x, this.y + pP.y);
    };
    this.sub = function(pP) {
        return new Point(this.x - pP.x, this.y - pP.y);
    };
    this.mul = function(pV) {
        return new Point(this.x * pV, this.y * pV);
    };
    this.div = function(pV) {
        return new Point(this.x / pV, this.y / pV);
    };
    this.len = function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    this.clone = function() {
        return new Point(this.x, this.y);
    };
};
var MathEx = {
    get DEG180() {
        return Math.PI / 180;
    },
    get DEG90() {
        return Math.PI / 90;
    },
    VectorAngle: function(pVector0, pVector1) {
        var temp0 = (pVector0.x * pVector1.x + pVector0.y * pVector1.y) / pVector0.len() / pVector1.len();
        var temp = Math.acos(temp0 <= 1 ? temp0 : 1) * 180 / Math.PI;
        return (pVector0.x * pVector1.y - pVector0.y * pVector1.x) < 0 ? temp : -temp;
    },
    Turn: function(pPoint, pValue, pCPoint) {
        if (pCPoint == undefined) {
            pCPoint = new Point();
        }
        var WH01 = pPoint.sub(pCPoint);
        var temp = new Point();
        var COS = Math.cos(-pValue * MathEx.DEG180);
        var SIN = Math.sin(-pValue * MathEx.DEG180);
        temp.x = WH01.x * COS + WH01.y * SIN + pCPoint.x;
        temp.y = -WH01.x * SIN + WH01.y * COS + pCPoint.y;
        return temp;
    }
};
var NumberEx = {
    BasicCrop: function(pNum) {
        if (pNum < 0) {
            return 0;
        } else if (pNum > 1) {
            return 1;
        } else {
            return pNum;
        }
    }
};

function ABC(pA, pB, pC) {
    var temp = pB * pB - 4 * pA * pC;
    if (temp < 0) {
        return null;
    }
    temp = Math.sqrt(temp);
    var temp0 = -pB + temp;
    var temp1 = -pB - temp;
    if (pA != 0) {
        return [temp0 / (2 * pA), temp1 / (2 * pA)];
    } else {
        if (temp0 != 0 && temp1 != 0) {
            return [(2 * pC) / temp0, (2 * pC) / temp1];
        } else if (temp0 != 0) {
            return [(2 * pC) / temp0];
        } else {
            return [(2 * pC) / temp1];
        }
    }
}

function ChangeValue(pT, pWeights) {
    if (pWeights == undefined) {
        pWeights = 0.5
    }
    var temp = ABC(1 - 2 * pWeights, 2 * pWeights, -pT);
    var temp0 = 0;
    if (temp) {
        if (temp.length > 1) {
            if (temp[0] > 0) {
                temp0 = temp[0];
            } else if (temp[0] > 0) {
                temp0 = temp[1];
            }
        } else {
            if (temp[0] > 0) {
                temp0 = temp[0];
            }
        }
    }
    return temp0;
}

function Bezier(pT, pA, pB, pC) {
    return (1 - pT) * (1 - pT) * pA + 2 * pT * (1 - pT) * pB + pT * pT * pC
}


var canvas01 = document.getElementById("canvas01");
var renderer = new PIXI.WebGLRenderer(600, 600, {
    view: canvas01,
    //transparent: true,
    antialias: true
});

var n = 20;
var color = d3.scaleSequential().domain([0, n]).interpolator(d3.interpolatePlasma);
var nodes = d3.range(0, n, 1)
    .map(function(d, i) {
        var obj = {
            p: new Point(400, 600 - i * 20),
            v: new Point(),
            v0: new Point(),
            weights: 0.1 * (0.5 + 0.5 * (i / n)),
            len: 30 * (0.5 + 0.5 * (1 - i / n))
        };
        return obj;
    });

var mp = new Point(400, 600);

var stage = new PIXI.Container();


var sprites = [];
nodes.forEach(function(d, i) {
    var circle = new PIXI.Graphics();
    //circle.beginFill(0xff0000);
    circle.beginFill(parseInt(color(n - i).substr(1), 16));
    circle.drawCircle(0, 0, d.len / 2);
    circle.endFill();
    var texture = circle.generateCanvasTexture(3 * 3, PIXI.SCALE_MODES.DEFAULT);
    var sprite = new PIXI.Sprite(texture);
    sprite.position.set(d.p.x, d.p.y);
    sprite.anchor.set(0.5);
    stage.addChild(sprite);
    sprites[i] = sprite;
});
d3.select("#canvas01")
    .on('mousemove', function() {
        var point = d3.mouse(this);
        mp.x = point[0];
        mp.y = point[1];
    })


function render() {
    var move;
    var ax;
    var ay;
    var rate = 1;
    var i;
    var ssXY = new Point();
    var angle
    var vector01
    var vector02    
    //nodes[0].p = mp.sub(nodes[0].p).mul(0.6).add(nodes[0].p);
    //nodes[0].v = nodes[0].v.mul((1 - rate) * 0.90 + 0.10);
    
    nodes.forEach(function(d, i) {
        /*if (i > 0) {
            vector02 = ((i - 2) >= 0) ? nodes[i - 1].p.sub(nodes[i - 2].p) : (new Point(0, -1));
            vector01 = nodes[i].p.sub(nodes[i - 1].p);
            angle = MathEx.VectorAngle(vector01, vector02);
            rate = Bezier(ChangeValue(NumberEx.BasicCrop((Math.abs(angle) - 0) / (30 - 0)), 0.3), 1, 0, 1);
            ssXY = ssXY.mul(0.7).add(new Point(vector01.y, -vector01.x).div(vector01.len()).mul(rate * angle * nodes[i].weights));
            rate = Bezier(ChangeValue(NumberEx.BasicCrop((vector01.len() - 5) / (40 - 5)), 0.3), 1, 0, 1);
            move = vector01.mul(((nodes[i].len / vector01.len()) - 1) * rate * nodes[i].weights);
            ssXY = ssXY.add(move);
            nodes[i].v = nodes[i].v.add(ssXY);
        }*/
        //rate = Bezier(ChangeValue(NumberEx.BasicCrop((Math.abs(angle) - 0) / (30 - 0)), 0.3), 1, 0, 1);
        if (i > 0) {
            vector01 = nodes[i].p.sub(nodes[i-1].p);
            rate = Bezier(ChangeValue(NumberEx.BasicCrop((vector01.len() - nodes[i].len*0.5) / (nodes[i].len*1.5 - nodes[i].len*0.5)), 0.3), 0.3, 2, 0.3);
            nodes[i].v = nodes[i].v.add(vector01.mul(nodes[i].len / vector01.len()-1).mul(rate*nodes[i].weights))
            //nodes[i].v = nodes[i].v.mul(0.99)
            nodes[i].p = nodes[i].p.add(nodes[i].v);
        }else{
            vector01 = mp.sub(nodes[i].p);
            nodes[i].v = vector01;
            nodes[i].p = nodes[i].p.add(vector01)
        }
    });
    
    /*nodes.forEach(function(d, i) {
        if (i > 0) {
            nodes[i].p = nodes[i].p.add(nodes[i].v);
        }
    });
    nodes.forEach(function(d, i) {
        if (i > 0) {
            vector01 = nodes[i].p.sub(nodes[i - 1].p);
            rate = Bezier(ChangeValue(NumberEx.BasicCrop((vector01.len() - 5) / (40 - 5)), 0.3), 1, 0.5, 1);
            move = vector01.mul(((nodes[i].len / vector01.len()) - 1) * rate);
            nodes[i].p = nodes[i].p.add(move);
            nodes[i].v = nodes[i].v.mul((1 - rate) * 0.90 + 0.10);
        }
    });*/
    nodes.forEach(function(d, i) {
        sprites[i].position.set(d.p.x, d.p.y);
    });
    renderer.render(stage);
    requestAnimationFrame(render);
}

render();