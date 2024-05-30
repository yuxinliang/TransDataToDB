package armatures
{
	public class SlotArmature
	{
		public var name:String;
		public var parent:String;
		public var displayIndex:Number;
		public var color:Object;
		
		public function SlotArmature()
		{
		}
		public function setData(data:Object):void
		{
			if(data.hasOwnProperty("name"))
				this.name = data.name;
			if(data.hasOwnProperty("bone"))
				this.parent = data.bone;
			this.displayIndex = 0;
			this.color = new Object();
			this.color.aM = 0;
			this.color.rM = 0;
			this.color.gM = 0;
			this.color.bM = 0;
			this.color.aO = 0;
			this.color.rO = 0;
			this.color.gO = 0;
			this.color.bO = 0;
			
		}
	}
}