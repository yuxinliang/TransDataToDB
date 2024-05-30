package armatures
{
	public class Animation
	{
		/**上级设定，run,stop,float等**/
		public var name:String;
		public var fadeInTime:Number;
		public var scale:Number;
		public var playTimes:Number;
		public var tweenEasing:String;
		public var disableTween:Number;
		
		/**只记录事件，最后处理**/
		public var frame:Array;
		public var bone:Array;
		public var slot:Array;
		/**边界问题，最后处理**/
		public var boundary:Array;
		
		
		public function Animation()
		{
		}
		
		public function setData(data:Object):void
		{
			this.fadeInTime = 0;
			this.scale = 1;
			this.playTimes = 0;
			this.tweenEasing = "";
			this.disableTween = 1;
			
			this.frame = [];
			
			
			this.bone = [];
			var obj:String = "";
			if(data.hasOwnProperty("bones")){
				for(obj in data.bones){
					var _bone:BoneAnimation = new BoneAnimation();
					_bone.name = obj;
					_bone.setData(data.bones[obj]);
					this.bone.push(_bone);
				}
			}
			
			this.slot = [];
			if(data.hasOwnProperty("slots")){
				for(obj in data.slots){
					var _slot:SlotAnimation = new SlotAnimation();
					_slot.name = obj;
					_slot.setData(data.slots[obj]);
					this.slot.push(_slot);
				}
			}
			
			this.boundary = [];
		}
	}
}