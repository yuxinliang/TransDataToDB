var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/**
 * Created by Administrator on 2015/8/19.
 */
var daxiang = (function (_super) {
    __extends(daxiang, _super);
    function daxiang() {
        _super.apply(this, arguments);
    }
    daxiang.prototype.checkDataValid = function () {
        var _supper = false;
        return _supper;
    };
    daxiang.prototype.convertToDBData = function (spineJson) {
        var data = spineJson;
        return "daxiang：" + data;
    };
    return daxiang;
})(DBImportTemplate);
