package armatures
{
	public class FrameSlotAnimation
	{
		public var duration:Number;
		public var dixplayIndex:Number;
		public var zOrder:Number;
		public var hide:Number;
		public var tweenEasing:Number;
		public var action:Number;
		
		public var color:Object;
		public function FrameSlotAnimation()
		{
		}
		public function setData(data:Object):void
		{
			if(data.hasOwnProperty("time"))
				this.duration = data.time;
			if(data.hasOwnProperty("name"))
				this.dixplayIndex = data.name;
				
			/*this.color = new Object();
			this.color.aM = 0;
			this.color.rM = 0;
			this.color.gM = 0;
			this.color.bM = 0;
			this.color.aO = 0;
			this.color.rO = 0;
			this.color.gO = 0;
			this.color.bO = 0;*/
		}
	}
}