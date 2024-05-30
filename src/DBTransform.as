package 
{
	public class DBTransform
	{
		public static var originDBTransform:DBTransform = new DBTransform();
		public var x:Number;
		public var y:Number;
		public var skewX:Number;
		public var skewY:Number;
		public var scaleX:Number;
		public var scaleY:Number;
		public function get rotation():Number
		{
			return (skewX + skewY)/2;
		}
		public function set rotation(value:Number):void
		{
			skewX = skewY = value;
		}
		public function DBTransform(_x:Number = 0, _y:Number = 0, _skewX:Number = 0, _skewY:Number = 0, _scaleX:Number = 1, _scaleY:Number = 1)
		{
			x = _x;
			y = _y;
			skewX = _skewX;
			skewY = _skewY;
			scaleX = _scaleX
			scaleY = _scaleY;
		}
		public function isEquals(transform:DBTransform):Boolean
		{
			return 	x == transform.x &&
					y == transform.y &&
					skewX == transform.skewX &&
					skewY == transform.skewY &&
					scaleX == transform.scaleX &&
					scaleY == transform.scaleY;
		}
		public function add(transform:DBTransform):void
		{
			x += transform.x;
			y += transform.y;
			skewX += transform.skewX;
			skewY += transform.skewY;
			scaleX *= transform.scaleX;
			scaleY *= transform.scaleY;
		}
		public function toString():String
		{
			var string:String = "x:" + x + " y:" + y + " skewX:" + skewX + " skewY:" + skewY + " scaleX:" + scaleX + " scaleY:" + scaleY;
			return string;
		}
	}
}

