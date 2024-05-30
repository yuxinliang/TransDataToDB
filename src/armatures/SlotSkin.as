package armatures
{
	public class SlotSkin
	{
		public var name:String = "";
		
		/**
		 *多张图片，根据displayIndex索引确定 
		 */
		public var display:Array;
		public function SlotSkin()
		{
		}
		public function setData(data:Object):void
		{
			this.display = [];
			for (var obj:String in data){
				var _display:DisplaySlotSkin = new DisplaySlotSkin();
				_display.name = obj;
				_display.setData(data[obj]);
				this.display.push(_display);
			}
		}
	}
}