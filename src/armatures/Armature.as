package armatures
{
	public class Armature
	{
		public var name:String;
		public var bone:Array;
		public var slot:Array;
		public var boundary:Array;
		public var skin:Array;
		public var animation:Array;
		public function Armature()
		{
		}
		public function setData(data:Object):void
		{
			name = "armatureName";
			this.bone = [];
			
			var i:int = 0;
			if(data.hasOwnProperty("bones")){
				var bones:Array = data.bones;
				for(i = 0;i<bones.length;i++){
					var _bone:BoneArmature = new BoneArmature();
					_bone.setData(bones[i])
					this.bone.push(_bone);
				};
			}
			
			this.slot = [];
			if(data.hasOwnProperty("slots")){
				var slots:Array = data.slots;
				for(i = 0;i<slots.length;i++){
					var _solt:SlotArmature = new SlotArmature();
					_solt.setData(slots[i]);
					this.slot.push(_solt);
				}
			}
			
			this.boundary = [];
			var _boundary:BoundaryArmature = new BoundaryArmature();
			_boundary.setData();
			this.boundary.push(_boundary);
			
			this.skin = [];
			var obj:String = "";
			if(data.hasOwnProperty("skins")){
				for(obj in data.skins){
					var _skin:Skin = new Skin();
					_skin.name = obj;
					_skin.setData(data.skins[obj]);
					this.skin.push(_skin)
				}
			}
			
			this.animation = [];
			if(data.hasOwnProperty("animations")){
				for(obj in data.animations){
					var _animation:Animation = new Animation();
					_animation.name = obj;
					_animation.setData(data.animations[obj]);
					this.animation.push(_animation)
				}
			}
			
		}
	}
}