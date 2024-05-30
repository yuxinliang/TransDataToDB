var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/**
 * Created by Administrator on 2015/8/19.
 */
var xiaozhi = (function (_super) {
    __extends(xiaozhi, _super);
    function xiaozhi() {
        _super.apply(this, arguments);
    }
    xiaozhi.prototype.checkDataValid = function () {
        var _supper = false;
        return _supper;
    };
    xiaozhi.prototype.convertToDBData = function (spineJson) {
        var data = spineJson;
        return "xiaozhi：" + data;
    };
    return xiaozhi;
})(DBImportTemplate);
