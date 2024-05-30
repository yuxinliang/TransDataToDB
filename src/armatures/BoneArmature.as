package armatures
{
	public class BoneArmature
	{
		public var name:String = "";
		public var parent:String = "";
		public var length:Number = 0;
		public var color:String = "";
		public var transform:Object;
		public function BoneArmature()
		{
		}
		public function setData(data:Object):void
		{
			if(data.hasOwnProperty("name"))
				name = data.name;
			
			if(data.hasOwnProperty("parent"))
				parent = data.parent;
			
			if(data.hasOwnProperty("length"))
				length = data.length;
			
			if(data.hasOwnProperty("color"))
				color = data.color;
			
			transform = new Object();
			transform.x = data.x;
			transform.y = -data.y;
			transform.scX = 1;
			transform.scY = 1;
			transform.skX = -data.rotation;
			transform.skY = -data.rotation;
		}
	}
}