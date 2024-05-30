package armatures
{
	public class BoneAnimation extends Object
	{
		public var name:String;
		/*public var scale:Number;
		public var offset:Number;
		public var pX:Number;
		public var pY:Number;*/
		public var frame:Array;
		public function BoneAnimation()
		{
		}
		public function setData(data:Object):void
		{
			this.frame = [];
			var _frame:FrameBoneAnimation
			var obj:Object
			if(data.hasOwnProperty("rotate")){
				for each(obj in data.rotate){
					_frame = new FrameBoneAnimation();
					if(obj.hasOwnProperty("time"))
						_frame.duration = obj.time;
					_frame.setRotateData(obj);
					this.frame.push(_frame);
				}
			}
			var flag:Number = -1;
			if(data.hasOwnProperty("translate")){
				for each(obj in data.translate){
					if(obj.hasOwnProperty("time"))
						flag = getFrameForTime(obj.time);
					if(flag<0){
						_frame = new FrameBoneAnimation();
						this.frame.push(_frame);
					}else{
						_frame = this.frame[flag];
					}
					_frame.setTranslateData(obj);
				}
			}
			flag = -1
			if(data.hasOwnProperty("scale")){
				for each(obj in data.scale){
					if(obj.hasOwnProperty("time"))
						flag = getFrameForTime(obj.time);
					if(flag<0){
						_frame = new FrameBoneAnimation();
						this.frame.push(_frame);
					}else{
						_frame = this.frame[flag];
					}
					_frame.setScaleData(obj);
				}
			}
			
			
		}
		
		public function getFrameForTime(times:Number):Number{
			var flag:Number = -1;
			for(var i:int=0;i<this.frame.length;i++){
				if(this.frame[i].duration == times)
					flag = i;
			}
			return flag;
		}
	}
}