var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/**
 * Created by Administrator on 2015/9/17.
 */
var entryPlugin = (function (_super) {
    __extends(entryPlugin, _super);
    function entryPlugin() {
        _super.apply(this, arguments);
    }
    entryPlugin.prototype.dataFileExtension = function () {
        try {
            return _super.prototype.dataFileExtension.call(this);
        }
        catch (e) {
        }
    };
    entryPlugin.prototype.dataFileDescription = function () {
        try {
            return _super.prototype.dataFileDescription.call(this);
        }
        catch (e) {
        }
    };
    entryPlugin.prototype.textureAtlasDataFileExtension = function () {
        try {
            return _super.prototype.textureAtlasDataFileExtension.call(this);
        }
        catch (e) {
        }
    };
    entryPlugin.prototype.isSupportTextureAtlas = function () {
        try {
            return _super.prototype.isSupportTextureAtlas.call(this);
        }
        catch (e) {
        }
    };
    entryPlugin.prototype.checkDataValid = function (data) {
        try {
            return _super.prototype.checkDataValid.call(this, data);
        }
        catch (e) {
        }
    };
    entryPlugin.prototype.convertToDBData = function (data) {
        try {
            return _super.prototype.convertToDBData.call(this, data);
        }
        catch (e) {
        }
    };
    entryPlugin.prototype.convertToDBTextureAtlasData = function (data) {
        try {
            return _super.prototype.convertToDBTextureAtlasData.call(this, data);
        }
        catch (e) {
        }
    };
    return entryPlugin;
})(spine);
