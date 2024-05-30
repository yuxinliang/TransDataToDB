package armatures
{
	public class SlotAnimation
	{
		public var name:String;
		public var scale:Number;
		public var offset:Number;
		
		public var frame:Array;
		public function SlotAnimation()
		{
		}
		public function setData(data:Object):void
		{
			this.frame = [];
			if(data.hasOwnProperty("attachment")){
				for each(var obj:Object in data.attachment){
					var _frame:FrameSlotAnimation = new FrameSlotAnimation();
					_frame.setData(obj);
					this.frame.push(_frame);
				}
			}
		}
	}
}