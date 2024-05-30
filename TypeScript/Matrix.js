var Matrix = (function () {
    function Matrix() {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.tx = 0;
        this.ty = 0;
    }
    Matrix.prototype.invert = function () {
        var a1 = this.a;
        var b1 = this.b;
        var c1 = this.c;
        var d1 = this.d;
        var tx1 = this.tx;
        var n = a1 * d1 - b1 * c1;
        this.a = d1 / n;
        this.b = -b1 / n;
        this.c = -c1 / n;
        this.d = a1 / n;
        this.tx = (c1 * this.ty - d1 * tx1) / n;
        this.ty = -(a1 * this.ty - b1 * tx1) / n;
    };
    Matrix.prototype.concat = function (m) {
        var ma = m["a"];
        var mb = m["b"];
        var mc = m["c"];
        var md = m["d"];
        var tx1 = this.tx;
        var ty1 = this.ty;
        if (ma != 1 || mb != 0 || mc != 0 || md != 1) {
            var a1 = this.a;
            var b1 = this.b;
            var c1 = this.c;
            var d1 = this.d;
            this.a = a1 * ma + b1 * mc;
            this.b = a1 * mb + b1 * md;
            this.c = c1 * ma + d1 * mc;
            this.d = c1 * mb + d1 * md;
        }
        this.tx = tx1 * ma + ty1 * mc + m["tx"];
        this.ty = tx1 * mb + ty1 * md + m["ty"];
    };
    Matrix.prototype.concatss = function (other) {
        var a = this.a * other.a;
        var b = 0.0;
        var c = 0.0;
        var d = this.d * other.d;
        var tx = this.tx * other.a + other.tx;
        var ty = this.ty * other.d + other.ty;
        if (this.b !== 0.0 || this.c !== 0.0 || other.b !== 0.0 || other.c !== 0.0) {
            a += this.b * other.c;
            d += this.c * other.b;
            b += this.a * other.b + this.b * other.d;
            c += this.c * other.a + this.d * other.c;
            tx += this.ty * other.c;
            ty += this.tx * other.b;
        }
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
    };
    Matrix.prototype.copyFrom = function (m) {
        this.tx = m.tx;
        this.ty = m.ty;
        this.a = m.a;
        this.b = m.b;
        this.c = m.c;
        this.d = m.d;
    };
    Matrix.prototype.transformPoint = function (pointX, pointY) {
        var x = this.a * pointX + this.c * pointY + this.tx;
        var y = this.b * pointX + this.d * pointY + this.ty;
        return new Point(x, y);
    };
    return Matrix;
})();
