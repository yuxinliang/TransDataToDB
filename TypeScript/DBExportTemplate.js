/**
 * Created by Administrator on 2015/8/11.
 */
var DBExportTemplate = (function () {
    function DBExportTemplate() {
        this._type = "DBExportTemplate";
    }
    DBExportTemplate.prototype.type = function () {
        return this._type;
    };
    return DBExportTemplate;
})();
