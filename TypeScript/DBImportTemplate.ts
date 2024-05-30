/**
 * Created by Administrator on 2015/8/11.
 */
class DBImportTemplate  {

    public _type = "DBImportTemplate";
    /**支持导入的数据文件的扩展名**/
    public dataFileExtension()
    {
        return ["*"]
    }
    /**支持导入的数据文件的描述**/
    public dataFileDescription()
    {
        return ""
    }
    /**纹理集数据文件扩展名**/
    public textureAtlasDataFileExtension()
    {
        return ["*"]
    }
    /**查验导入数据是否支持纹理集**/
    public isSupportTextureAtlas()
    {
        return false
    }
    /**查验导入数据是否支持本解析器**/
    public checkDataValid(data)
    {
        return true
    }
    /**导入数据的解析**/
    public convertToDBData(data)
    {
        return data
    }
    /**纹理集的解析**/
    public convertToDBTextureAtlasData(data)
    {
        return data
    }
    public type()
    {
        return this._type;
    }

}


