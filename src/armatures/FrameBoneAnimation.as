package armatures
{
	public class FrameBoneAnimation extends Object
	{
		public var duration:Number;
		/*public var tweenEasing:Number;
		public var tweenRotate:Number;
		public var event:String;
		public var sound:String;*/
		
		public var transform:Object;
		
		public function FrameBoneAnimation()
		{
			this.transform = new Object();
			/*this["transform"] .x = 0;
			this["transform"] .y = 0;
			this["transform"] .scX = 1;
			this["transform"] .scY = 1;
			this["transform"] .skX = 1;
			this["transform"] .skY = 1;*/
		}
		public function setRotateData(data:Object):void
		{
			if(data.hasOwnProperty("angle")){
				this["transform"].skX = -data.angle;
				this["transform"].skY = -data.angle;
			}
			
		}
		public function setTranslateData(data:Object):void
		{
			if(data.hasOwnProperty("x")){
				this["transform"].x = data.x;
			}
			if(data.hasOwnProperty("y")){
				this["transform"].y = -data.y;
			}

		}
		public function setScaleData(data:Object):void
		{
			if(data.hasOwnProperty("x")){
				this["transform"].scX = data.x;
			}
			if(data.hasOwnProperty("y")){
				this["transform"].scY = -data.y;
			}
			
		}
	}
}