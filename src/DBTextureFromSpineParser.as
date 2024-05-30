package
{
	/**
	 * Spine纹理集解析器
	 * @author YX
	 */
	public class DBTextureFromSpineParser
	{
		public function DBTextureFromSpineParser()
		{
		}
		/**转化spine纹理集数据为DB纹理集数据**/
		public static function transAtlasToTexture(data:String):Object
		{
			var dbTexture:Object = new Object();
			var arr:Array = data.split("\n")
			var i:int
			for ( i= 0; i < arr.length; i++) 
			{
				if(arr[i] == "" || arr[i] == "\r")
				{
					arr.splice(i,1);
				}
			}
			for (i = 0; i < arr.length; i++) 
			{
				arr[i] = arr[i].replace("\r","");
			}
			dbTexture.imagePath = arr[0];
			dbTexture.SubTexture = [];
			var imageArr:Array = arr.slice(5)
			for (var j:int = 0; j < imageArr.length;) 
			{
				var image:Object = new Object();
				image.name = imageArr[j];
				var rota:String = imageArr[j+1];
				rota = rota.slice(10);
				if(rota == "true"){
					image["rotated"] = rota;
				}
				var xy:String= imageArr[j+2];
				xy = xy.slice(5);
				var aa:Array = xy.split(",");
				image.x =Number(aa[0]);
				image.y =Number(aa[1]);
				var size:String= imageArr[j+3];
				size = size.slice(7);
				aa = size.split(",");
				image.width = Number(aa[0]);
				image.height = Number(aa[1]);
				/*var orig:String= imageArr[j+4];
				orig = orig.slice(7);
				aa = orig.split(",");
				image.frameWidth = Number(aa[0]);
				image.frameHeight = Number(aa[1]);
				var offset:String= imageArr[j+5];
				offset = offset.slice(9);
				aa = offset.split(",");
				image.frameX = Number(aa[0]);
				image.frameY = Number(aa[1]);*/
				j+=7;
				dbTexture.SubTexture.push(image);
			}
			return dbTexture
		}
	}
}