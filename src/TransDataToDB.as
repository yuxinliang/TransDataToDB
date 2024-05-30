package
{
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.filesystem.File;
	import flash.net.URLLoader;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLRequest;
	import flash.text.TextField;
	
	import armatures.Armature;
	
	
	public class TransDataToDB extends Sprite
	{
		private var load:URLLoader;
		private var spineJsonString:String; 
		private var spineJson:Object;
		
		private var DBJsonString:String;
		/**
		 * DB4.0数据格式
		 */
		private var DBJson:Object;
		private const SPINE_FRAME:int = 30;
		
		private var btn1:Sprite;
		private var btn2:Sprite;
		private var txt1:TextField;
		private var txt2:TextField;
		
		/**标记 1：SpineJson数据，2：SpineTexture数据**/
		private var DATA_TYPE:int = 0;
		public function TransDataToDB()
		{
			this.addEventListener(Event.ADDED_TO_STAGE,addToStage)
		}
		private function addToStage(e:Event):void{
			btn1 = new Sprite();
			btn1.addEventListener(MouseEvent.CLICK,btnClickHandler);
			this.addChild(btn1);
			btn1.graphics.beginFill(0xFFFF00,1);
			btn1.graphics.drawRect(0,0,100,50);
			btn1.graphics.endFill();
			
			btn2 = new Sprite();
			btn2.addEventListener(MouseEvent.CLICK,btnClickHandler);
			btn2.y = 70;
			this.addChild(btn2);
			btn2.graphics.beginFill(0xFFFF00,1);
			btn2.graphics.drawRect(0,0,100,50);
			btn2.graphics.endFill();
			
			txt1 = new TextField();
			txt1.text = "SpineData";
			txt1.mouseEnabled = false;
			
			txt2 = new TextField();
			txt2.text = "SpineTexture";
			txt2.mouseEnabled = false;
			
			btn1.addChild(txt1);
			btn2.addChild(txt2);
		}
		private function btnClickHandler(e:MouseEvent):void
		{
			switch(e.currentTarget)
			{
				case btn1:
				{
					DATA_TYPE = 1;
					break;
				}
				case btn2:
				{
					DATA_TYPE = 2;
					break;
				}
				default:
				{
					break;
				}
			}
			FileUtil.browseForOpen(addFileJson,1);
		}
		private function addFileJson(file:File):void
		{
			if(!file)
				return;
			nameExt = FileUtil.getFileName(file.nativePath);
			fileUrl = FileUtil.getDirectory(file.nativePath);
			var url:URLRequest = new URLRequest(file.nativePath);
			load = new URLLoader();
			load.dataFormat=URLLoaderDataFormat.TEXT; 
			load.addEventListener(Event.COMPLETE,complete);
			load.load(url);
		}
		private var nameExt:String = "";
		private var fileUrl:String = ""
		private function complete(evt:Event):void{
			trace("载入成功" );
//			var bytes:ByteArray = FileUtil.openAsByteArray("cache.amf");
//			if(bytes)
//			{
//				try
//				{
//					bytes.uncompress();
//					var cacheObject:Object = bytes.readObject();
//				}
//				catch(e:Error){}
//			}
			//return;
			try {
				spineJsonString = evt.target.data;
				//trans(spineJson);
				switch(DATA_TYPE)
				{
					case 1:
					{
						spineJson = JSON.parse(spineJsonString);
						FileUtil.save(fileUrl+"/"+nameExt+"_DB.json",JSON.stringify(DBDataFromSpineParser.trans(spineJson)));
						trace(JSON.stringify(DBDataFromSpineParser.trans(spineJson)));
						break;
					}
					case 2:
					{
						FileUtil.save(fileUrl+"/"+nameExt+"_DBTexture.json",JSON.stringify(DBTextureFromSpineParser.transAtlasToTexture(spineJsonString)));
						trace(JSON.stringify(DBTextureFromSpineParser.transAtlasToTexture(spineJsonString)));
						break;
					}
					default:
					{
						break;
					}
				}
			} 
			catch (e:TypeError) {
				trace("类型错误" );
			} 
		}
		/**转化Spine数据为DB4.0数据,默认数据会显示出来，暂时无用**/
		private function trans(data:Object):void
		{
			DBJson = new Object();
			DBJson.name = "dataName";
			DBJson.version = "4.0";
			DBJson.frameRate = 24;
			DBJson.isGlobal = 0;
			DBJson.armature = [];
			for(var i:int = 0;i<1;i++){
				var armature:Armature = new Armature();
				armature.setData(data);
				DBJson.armature.push(armature)
			}
			trace(JSON.stringify(DBJson));
		}
	}
}