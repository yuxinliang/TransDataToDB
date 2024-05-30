/**
 * Created by Administrator on 2015/8/11.
 */
var DBImportTemplate = (function () {
    function DBImportTemplate() {
        this._type = "DBImportTemplate";
    }
    /**支持导入的数据文件的扩展名**/
    DBImportTemplate.prototype.dataFileExtension = function () {
        return ["*"];
    };
    /**支持导入的数据文件的描述**/
    DBImportTemplate.prototype.dataFileDescription = function () {
        return "";
    };
    /**纹理集数据文件扩展名**/
    DBImportTemplate.prototype.textureAtlasDataFileExtension = function () {
        return ["*"];
    };
    /**查验导入数据是否支持纹理集**/
    DBImportTemplate.prototype.isSupportTextureAtlas = function () {
        return false;
    };
    /**查验导入数据是否支持本解析器**/
    DBImportTemplate.prototype.checkDataValid = function (data) {
        return true;
    };
    /**导入数据的解析**/
    DBImportTemplate.prototype.convertToDBData = function (data) {
        return data;
    };
    /**纹理集的解析**/
    DBImportTemplate.prototype.convertToDBTextureAtlasData = function (data) {
        return data;
    };
    DBImportTemplate.prototype.type = function () {
        return this._type;
    };
    return DBImportTemplate;
})();
