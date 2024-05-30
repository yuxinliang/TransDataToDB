package armatures
{
	public class Skin
	{
		public var name:String = "";
		public var slot:Array;
		public var boundary:Array;
		public function Skin()
		{
		}
		public function setData(data:Object):void
		{
			this.slot = [];
			for (var obj:String in data){
				var _slot:SlotSkin = new SlotSkin();
				_slot.name = obj;
				_slot.setData(data[obj]);
				this.slot.push(_slot);
			}
			
			this.boundary = [];
			var _boundary:BoundarySkin = new BoundarySkin();
			this.boundary.push(_boundary);
		}
	}
}