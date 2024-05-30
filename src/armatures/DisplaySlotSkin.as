package armatures
{
	public class DisplaySlotSkin
	{
		/**
		 *图片的物理地址 ，如果transform有name，取name ，没有，父级设定
		 */
		public var name:String;
		public var type:String;
		public var transform:Object;
		public function DisplaySlotSkin()
		{
		}
		public function setData(data:Object):void
		{
			this.type = "image";
			this.transform = new Object();
			this.transform.x = data.x;
			this.transform.y = -data.y;
			this.transform.scX = 1;
			this.transform.scY = 1;
			this.transform.skX = -data.rotation;
			this.transform.skY = -data.rotation;
			
		}
	}
}