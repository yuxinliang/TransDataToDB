package 
{
	import flash.events.Event;
	import flash.events.FileListEvent;
	import flash.filesystem.File;
	import flash.filesystem.FileMode;
	import flash.filesystem.FileStream;
	import flash.utils.ByteArray;
	public class FileUtil
	{
		public static function save(path:String,data:Object,deleteExist:Boolean=true,charSet:String="",globalPath:Boolean = false):Boolean
		{
			path = escapePath(path);
			var file:File;
			if(globalPath)
			{
				try
				{
					file = new File(path);
				} 
				catch(error:Error) 
				{
					return false;
				}
			}else
			{
				file = new File(File.applicationDirectory.resolvePath(path).nativePath);
			}
			
			if(deleteExist&&file.exists)
			{//如果存在，先删除，防止出现文件名大小写不能覆盖的问题
				deletePath(file.nativePath);
			}
			if(file.isDirectory)
				return false;
			var fs:FileStream = new FileStream;
			try
			{
				fs.open(file,FileMode.WRITE);
				if(data is ByteArray)
				{
					fs.writeBytes(data as ByteArray);
				}
				else if(data is String)
				{
					if(charSet)
					{
						fs.writeMultiByte(data as String,charSet);
					}
					else
					{
						fs.writeUTFBytes(data as String);
					}
					
				}
				else
				{
					fs.writeObject(data);
				}
			}
			catch(e:Error)
			{
				fs.close();
				return false;
			}
			fs.close();
			return true;
		}
		public static function open(path:String):FileStream
		{
			path = escapePath(path);
			var file:File = new File(File.applicationDirectory.resolvePath(path).nativePath);
			var fs:FileStream = new FileStream;
			try
			{
				fs.open(file,FileMode.READ);
			}
			catch(e:Error)
			{
				return null;
			}
			return fs;
		}
		public static function openAsByteArray(path:String):ByteArray
		{
			path = escapePath(path);
			var fs:FileStream = open(path);
			if(!fs)
				return null;
			fs.position = 0;
			var bytes:ByteArray = new ByteArray();
			fs.readBytes(bytes);
			fs.close();
			return bytes;
		}
		public static function openAsString(path:String):String
		{
			path = escapePath(path);
			var fs:FileStream = open(path);
			if(!fs)
				return "";
			fs.position = 0;
			var content:String = fs.readUTFBytes(fs.bytesAvailable);
			fs.close();
			return content;
		}
		public static function browseForOpen(onSelect:Function,type:int=1,typeFilter:Array=null,title:String=null,defaultPath:String=""):void
		{
			defaultPath = escapePath(defaultPath);
			if(!title)
				title="FileUtil.Browse";
			var file:File;
			if(defaultPath=="")
				file = new File;
			else
				file = File.applicationDirectory.resolvePath(defaultPath);
			switch(type)
			{
				case 1:
					file.addEventListener(Event.SELECT,function(e:Event):void{
						onSelect(e.target as File);
					});
					file.browseForOpen(title,typeFilter);
					break;
				case 2:
					file.addEventListener(FileListEvent.SELECT_MULTIPLE,function(e:FileListEvent):void{
						onSelect(e.files);
					});
					file.browseForOpenMultiple(title,typeFilter);
					break;
				case 3:
					file.addEventListener(Event.SELECT,function(e:Event):void{
						onSelect(e.target as File);
					});
					file.browseForDirectory(title);
					break;
			}
		}
		public static function browseForSave(onSelect:Function,defaultPath:String=null,title:String=null,onCancel:Function = null):void
		{
			defaultPath = escapePath(defaultPath);
			if(!title)
				title="FileUtil.Save";
			var file:File
			if(defaultPath!=null)
				file = File.applicationDirectory.resolvePath(defaultPath);
			else
				file = new File;
			file.addEventListener(Event.SELECT,function(e:Event):void{
				onSelect(e.target as File);
			});
			file.addEventListener(Event.CANCEL,function(e:Event):void{
				if(onCancel != null)
				{
					onCancel();
				}
			});
			file.browseForSave(title);
		}
		public static function browseAndSave(data:Object,defaultPath:String=null,title:String=null):void
		{
			defaultPath = escapePath(defaultPath);
			if(!title)
				title="FileUtil.Save";
			var file:File
			if(defaultPath!=null)
				file = File.applicationDirectory.resolvePath(defaultPath);
			else
				file = new File;
			file.addEventListener(Event.SELECT,function(e:Event):void{
				save(file.nativePath,data);
			});
			file.browseForSave(title);
		}
		public static function moveTo(source:String,dest:String,overwrite:Boolean=false):Boolean
		{
			source = escapePath(source);
			dest = escapePath(dest);
			if(source==dest)
				return true;
			var file:File = new File(File.applicationDirectory.resolvePath(source).nativePath);
			//必须创建绝对位置的File才能移动成功。
			var destFile:File = new File(File.applicationDirectory.resolvePath(dest).nativePath);
			if(destFile.exists)
				deletePath(destFile.nativePath);
			try
			{
				file.moveTo(destFile,overwrite);
			}
			catch(e:Error)
			{
				return false;
			}
			return true;
		}
		public static function copyTo(source:String,dest:String,overwrite:Boolean=false):Boolean
		{
			source = escapePath(source);
			dest = escapePath(dest);
			if(source==dest)
				return true;
			var file:File = File.applicationDirectory.resolvePath(source);
			//必须创建绝对位置的File才能移动成功。
			var destFile:File = new File(File.applicationDirectory.resolvePath(dest).nativePath);
			if(destFile.exists)
				deletePath(destFile.nativePath);
			try
			{
				file.copyTo(destFile,overwrite);
			}
			catch(e:Error)
			{
				return false;
			}
			return true;
		}
		public static function deletePath(path:String,moveToTrash:Boolean = false):Boolean
		{
			path = escapePath(path);
			var file:File = new File(File.applicationDirectory.resolvePath(path).nativePath);
			if(moveToTrash)
			{
				try
				{
					file.moveToTrash();
				}
				catch(e:Error)
				{
					return false;
				}
			}
			else
			{
				if(file.isDirectory)
				{
					try
					{
						file.deleteDirectory(true);
					}
					catch(e:Error)
					{
						return false;
					}
				}
				else
				{
					try
					{
						file.deleteFile();
					}
					catch(e:Error)
					{
						return false;
					}
				}
			}
			return true;
		}
		public static function getDirectory(path:String):String
		{
			path = escapeUrl(path);
			var endIndex:int = path.lastIndexOf("/");
			if(endIndex==-1)
			{
				return "";
			}
			return path.substr(0,endIndex+1);
		}
		public static function getExtension(path:String):String
		{
			path = escapeUrl(path);
			var index:int = path.lastIndexOf(".");
			if(index==-1)
				return "";
			var i:int = path.lastIndexOf("/");
			if(i>index)
				return "";
			return path.substring(index+1);
		}
		public static function getFileName(path:String):String
		{
			if(path==null||path=="")
				return "";
			path = escapePath(path);
			var startIndex:int = path.lastIndexOf("/");
			var endIndex:int;
			if(startIndex>0&&startIndex==path.length-1)
			{
				path = path.substring(0,path.length-1);
				startIndex = path.lastIndexOf("/");
				endIndex = path.length;
				return path.substring(startIndex+1,endIndex);
			}
			endIndex = path.lastIndexOf(".");
			if(endIndex<=startIndex)
				endIndex = path.length;
			return path.substring(startIndex+1,endIndex);
		}
		public static function search(dir:String,extension:String=null,filterFunc:Function=null):Array
		{
			dir = escapePath(dir);
			var file:File = File.applicationDirectory.resolvePath(dir);
			var result:Array = [];
			if(!file.isDirectory || file.isSymbolicLink)
				return result;
			extension = extension?extension.toLowerCase():"";
			findFiles(file,result,extension,filterFunc);
			return result;
		}
		private static function findFiles(dir:File,result:Array,
										  extension:String=null,filterFunc:Function=null):void
		{
			var fileList:Array = dir.getDirectoryListing();
			for each(var file:File in fileList)
			{
				if(file.isDirectory && !file.isSymbolicLink)
				{
					if(filterFunc!=null)
					{
						if(filterFunc(file))
						{
							findFiles(file,result,extension,filterFunc);
						}
					}
					else
					{
						findFiles(file,result,extension,filterFunc);
					}
				}
				else if(filterFunc!=null)
				{
					if(filterFunc(file))
					{
						result.push(file);
					}
				}
				else if(extension)
				{
					if(file.extension&&file.extension.toLowerCase() == extension)
					{
						result.push(file);
					}
				}
				else
				{
					result.push(file);
				}
			}
		}
		public static function url2Path(url:String):String
		{
			url = escapePath(url);
			var file:File = File.applicationDirectory.resolvePath(url);
			return escapeUrl(file.nativePath);
		}
		public static function path2Url(path:String):String
		{
			path = escapePath(path);
			return File.applicationDirectory.resolvePath(path).url;
		}
		public static function exists(path:String):Boolean
		{
			path = escapePath(path);
			var file:File = File.applicationDirectory.resolvePath(path);
			return file.exists;
		}
		public static function escapePath(path:String):String
		{
			if(!path)
				return "";
			if(path.indexOf("file:")==0)
			{
				try
				{
					var file:File = new File();
					file.url = path;
					path = file.nativePath;
				}
				catch(e:Error)
				{
				}
			}
			try
			{
				file = new File(path);
				if(file.exists)
				{
					if(file.isDirectory)
						path = file.nativePath+File.separator;
				}
				else
				{
					var ext:String = getExtension(path);
					if(!ext)
						path = file.nativePath+File.separator;
				}
			}
			catch(e:Error)
			{
			}
			path = path.split("\\").join("/");
			return path;
		}
		public static function escapeUrl(url:String):String
		{
			return Boolean(!url)?"":url.split("\\").join("/");
		}
	}
}