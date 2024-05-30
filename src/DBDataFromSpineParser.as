package 
{
	import flash.geom.Matrix;
	import flash.geom.Point;
	/**
	 * Spine的数据解析，转化Spine数据为DB4.0数据。调用trans静态方法取返回数据即可
	 * @author YX
	 * 
	 */
	public class DBDataFromSpineParser
	{
		public function DBDataFromSpineParser()
		{
		}
		public static function trans(spineData:Object):Object
		{
			var DBObject:Object = new Object();
			DBObject = transToNoParameter(spineData);
			return DBObject
		}
		/**转化spine数据为DB4.0数据，默认值参数不显示**/
		private static function transToNoParameter(data:Object):Object
		{
			var DBJson:Object = new Object();
			DBJson.name = "dataName";
			DBJson.version = "4.5";
			DBJson.frameRate = 30;
			DBJson.isGlobal = 0;
			DBJson.armature = [];
			for(var i:int = 0;i<1;i++){
				var armature:Object = new Object();
				armature.name = "armatureName";
				//---------------------------------------------------------//  BoneArmature
				if(data.hasOwnProperty("bones")){
					armature.bone = [];
					boneArmature(armature.bone,data.bones)
					createBoneList(armature.bone);
				}
				//--------------------------------------------------------------------------先写入skin，保证slot的displayIndex顺序编码
				//---------------------------------------------------------//  Skin 
				if(data.hasOwnProperty("skins")){
					armature.skin = [];
					weightedMesh = {}
					skin(armature.skin,data.skins);
				}
				//---------------------------------------------------------//  Skin
				//--------------------------------------------------------------------//添加IK数据
				if(data.hasOwnProperty("ik")){
					armature.ik = [];
					ikArmature(armature.ik,data.ik)
				}
				//---------------------------------------------------------//  BoneArmature
				//---------------------------------------------------------//  SlotArmature
				if(data.hasOwnProperty("slots")){
					armature.slot = [];
					slotArmature(armature.slot,data.slots);
					armatureSlot = armature.slot;
				}
				//---------------------------------------------------------//  SlotArmature
				//---------------------------------------------------------//  Animation
				if(data.hasOwnProperty("animations")){
					armature.animation = [];
					animation(armature.animation,data.animations);
				}
				//---------------------------------------------------------//  Animation
				DBJson.armature.push(armature)
			}
			return DBJson
		}
		//====================================华丽的分割线==================
		private static var weightedMesh:Object;
		/**记录槽位的父骨骼和默认显示DisplayIndex，没有Index，取0**/
		private static var armatureSlot:Array=[];
		/** BoneArmature **/
		private static function boneArmature(bone:Array,data:Object):void
		{
			for each( var obj:Object in data){
				var _bone:Object = new Object();//  BoneArmature
				if(obj.hasOwnProperty("name"))
					_bone.name = obj.name;
				
				if(obj.hasOwnProperty("parent"))
					_bone.parent = obj.parent;
				
				if(obj.hasOwnProperty("length"))
					_bone.length = obj.length;
				
				if(obj.hasOwnProperty("inheritRotation"))
					_bone.inheritRotation = (obj.inheritRotation==false?0:1);
				
				if(obj.hasOwnProperty("inheritScale"))
					_bone.inheritScale = (obj.inheritScale==false?0:1);
				
				if(obj.hasOwnProperty("color"))
					_bone.color = obj.color;
				//_bone.transform = new Object();
				if(obj.hasOwnProperty("x")){
					if(!_bone.transform){
						_bone.transform = new Object();
					}
					_bone.transform.x = obj.x;
				}
				if(obj.hasOwnProperty("y")){
					if(!_bone.transform){
						_bone.transform = new Object();
					}
					_bone.transform.y = -obj.y;
				}
				
				if(obj.hasOwnProperty("rotation")){
					if(!_bone.transform){
						_bone.transform = new Object();
					}
					_bone.transform.skX = -obj.rotation;
					_bone.transform.skY = -obj.rotation;
				}
				if(obj.hasOwnProperty("scaleX")){
					if(!_bone.transform){
						_bone.transform = new Object();
					}
					_bone.transform.scX = obj.scaleX;
				}
				if(obj.hasOwnProperty("scaleY")){
					if(!_bone.transform){
						_bone.transform = new Object();
					}
					_bone.transform.scY = obj.scaleY;
				}
				bone.push(_bone);
			}
		}
		private static function ikArmature(ik:Array,data:Object):void
		{
			for each( var obj:Object in data){
				var _ik:Object = new Object();
				if(obj.hasOwnProperty("name"))
					_ik.name = obj.name;
				if(obj.hasOwnProperty("target"))
					_ik.target = obj.target;
				if (obj.hasOwnProperty("bendPositive") && (obj["bendPositive"]==false)) {
					_ik["bendPositive"] = "true";
				} else {
					_ik["bendPositive"] = "false";
				}
				if(obj.hasOwnProperty("mix"))
					_ik.weight = obj.mix;
				if(obj.hasOwnProperty("bones")){
					if(obj.bones.length>1){
						_ik.bone = obj.bones[1];
						_ik.chain = 1;
					}else{
						_ik.bone = obj.bones[0];
						_ik.chain = 0;
					}
				}
				ik.push(_ik);
			}
		}
		/**SlotArmature**/
		private static function slotArmature(slot:Array,data:Object):void
		{
			for each( var obj:Object in data){
				var _solt:Object = new Object();  //  SlotArmature
				if(obj.hasOwnProperty("name"))
					_solt.name = obj.name;
				if(obj.hasOwnProperty("bone"))
					_solt.parent = obj.bone;
				
				if(obj.hasOwnProperty("attachment")){
					if(displayIndexObject[obj.attachment] != 0)
						_solt.displayIndex = displayIndexObject[obj.attachment];
				}else{
					_solt.displayIndex = -1; // 说明spine中的slot没有初始皮肤，即初始皮肤不显示，哥布林的眼睛
				}
				slot.push(_solt);
			}
		}
		/**Spine默认帧频为30**/
		private static const SPINE_FRAME:int = 30;
		/**slotArmature中    名称索引对应表**/
		private static var displayIndexObject:Object = new Object();;
		private static function skin(skin:Array,data:Object):void
		{
			var obj:String = "";
			var _skin:Object = new Object();
			_skin.name = "";
			_skin.slot = [];
			for(obj in data){
				//var _skin:Object = new Object();
				//_skin.name = "";
				/*if(obj == "default"){
				_skin.name = "";
				}*/
				//_skin.slot = [];
				slotSkin(_skin.slot,data[obj])
				
			}
			skin.push(_skin)
		}
		/**SlotSkin**/
		private static function slotSkin(slot:Array,data:Object):void
		{
			var flag:Boolean = false;
			for (var objs:String in data){
				for each(var oo:Object in slot){
					if(oo.name == objs){
						flag = true;
						continue;
					}
				}
				if(flag)
					continue;
				var _slot:Object = new Object();
				_slot.name = objs;
				_slot.display = [];
				displaySlotSkin(_slot.display,data[objs],objs)
				slot.push(_slot);
			}
		}
		private static var boneList:Array=[];
		/**DisplaySlotSkin**/
		private static function displaySlotSkin(display:Array,data:Object,objs:String):void
		{
			var i:int = -1;
			for (var objss:String in data){
				i++;
				displayIndexObject[objss] = i;
				var _display:Object = new Object();
				if(data[objss].name)
					_display.name = data[objss].name;
				else
					_display.name = objss;
				//新加mesh类型
				var j:int = 1
				if(data[objss].type && data[objss].type == "mesh"){
					_display.type = "mesh";
					if(data[objss].vertices){
						if(data[objss]["uvs"] && (data[objss]["uvs"].length != data[objss]["vertices"].length)){
							createWeightedMeshData(_display,data[objss]["vertices"]);
							weightedMesh[_display["name"]] = _display;
						}else{
							_display["vertices"] = data[objss]["vertices"];
							for(j = 1;j<_display["vertices"].length;j=j+2)
							{
								_display["vertices"][j] = -_display["vertices"][j];
							}
						}
						/*_display.vertices = data[objss].vertices;
						for(j = 1;j<_display.vertices.length;j=j+2) 
						{
							_display.vertices[j] = -_display.vertices[j]
						}*/
					}
				}else if(data[objss].type && (data[objss].type == "weightedmesh"|| data[objss].type == "skinnedmesh")){
					_display.type = "mesh";
					if(data[objss].vertices){
						//armature.bone
						createWeightedMeshData(_display,data[objss].vertices);
						weightedMesh[_display.name] = _display;//存储的包含bonePose weights
						/*_display.vertices = data[objss].vertices;
						for(j = 1;j<_display.vertices.length;j=j+2) 
						{
							_display.vertices[j] = -_display.vertices[j]
						}*/
						
					}
				}else{
					_display.type = "image";
					if(data[objss].vertices){
						_display.vertices = data[objss].vertices;
						for(j = 1;j<_display.vertices.length;j=j+2) 
						{
							_display.vertices[j] = -_display.vertices[j]
						}
					}
				}
				if(data[objss].uvs)
					_display.uvs = data[objss].uvs;
				if(data[objss].triangles)
					_display.triangles = data[objss].triangles;
				if(data[objss].width)
					_display.width = data[objss].width;
				if(data[objss].height)
					_display.height = data[objss].height;
				
				if (data[objss]["edges"]) {
					for (var numa:int = 0; numa < data[objss]["edges"].length; numa++) {
						data[objss]["edges"][numa] = (data[objss]["edges"][numa] / 2);
					}
					_display["edges"] = [];
					var edgesNum:int = data[objss]["edges"].length;
					var num:int = 0
					if (data[objss]["hull"]) {
						var ttArray:Object = spliceOutlineAndUserEdge(data[objss]["hull"] * 2, data[objss]["edges"], data[objss]["uvs"], data[objss]["width"], data[objss]["height"])
						if (ttArray) {
							_display["edges"] = ttArray["outline"];
							_display["userEdges"] = ttArray["userEdges"];
						} else {
							for (num = 0; num < edgesNum; num++) {
								_display["edges"].push(data[objss]["edges"][num]);
							}
						}
					} else {
						for (num = 0; num < edgesNum; num++) {
							_display["edges"].push(data[objss]["edges"][num]);
						}
					}
				}
				/*if(data[objss]["edges"])
				{
					_display["edges"] = [];
					var edgesNum:int = data[objss]["edges"].length;
					if(data[objss]["hull"]){
						edgesNum = data[objss]["hull"]*2
					}
					for(var num:int = 0;num<data[objss]["edges"].length;num++){
						if(num >= edgesNum){
							if(!_display["userEdges"]){
								_display["userEdges"]=[];
							}
							_display["userEdges"].push(data[objss]["edges"][num]/2);
						}else{
							_display["edges"].push(data[objss]["edges"][num]/2);
						}
					}
				}*/
				//新加mesh类型
				
				if(data[objss].hasOwnProperty("x")){
					if(!_display.transform){
						_display.transform = new Object();
					}
					_display.transform.x = data[objss].x;
				}
				if(data[objss].hasOwnProperty("y")){
					if(!_display.transform){
						_display.transform = new Object();
					}
					_display.transform.y = -data[objss].y;
				}
				if(data[objss].hasOwnProperty("rotation")){
					if(!_display.transform){
						_display.transform = new Object();
					}
					_display.transform.skX = -data[objss].rotation;
					_display.transform.skY = -data[objss].rotation;
				}
				display.push(_display);
			}
		}
		private static function animation(animation:Array,data:Object):void
		{
			var obj:String = ""
			for(obj in data){
				var _animation:Object = new Object();
				_animation.name = obj;
				//解析Zorder
				if(data[obj].hasOwnProperty("drawOrder")){
					_animation["zOrder"]= new Object();
					_animation["zOrder"]["frame"] = [];
					var isFirstzorder:Boolean = false;
					var objdo:Object
					for each(objdo in data[obj]["drawOrder"]){
						var _zOrder:Object = new Object();
						if(objdo["time"] == 0){
							isFirstzorder = true;
						}
						zOrderAnimation(_zOrder,objdo);
						_animation["zOrder"]["frame"].push(_zOrder);
					}
					if(!isFirstzorder){
						var zo:Object = new Object();
						zo["duration"] = 0;
						_animation["zOrder"]["frame"].push(zo);
					}
					_animation["zOrder"]["frame"].sort(Compare);
					repairDuration(_animation["zOrder"]["frame"]);
				}
				//解析Zorder完毕
				if(data[obj].hasOwnProperty("bones")){
					_animation.bone = [];
					var objb:String = "";
					for(objb in data[obj].bones){
						var _bone:Object = new Object();
						_bone.name = objb;
						boneAnimation(_bone,data[obj].bones[objb])
						_animation.bone.push(_bone);
					}
				}
				//新加mesh
				if(data[obj].hasOwnProperty("ffd")){
					_animation.ffd= [];
					var objf:String = "";
					for(objf in data[obj].ffd){
						//_ffd.name = objf;
						ffdAnimation(_animation.ffd,data[obj].ffd[objf])
					}
				}
				//3.*.*版本以上用 deform 替代了 ffd
				if(data[obj].hasOwnProperty("deform")){
					_animation.ffd= [];
					var objDeform:String = "";
					for(objDeform in data[obj].deform){
						//_ffd.name = objf;
						ffdAnimation(_animation.ffd,data[obj].deform[objDeform])
					}
				}
				//3.*.*版本以上用 deform 替代了 ffd
				//新加mesh
				if(data[obj].hasOwnProperty("slots")){
					_animation.slot = [];
					var objs:String = "";
					for(objs in data[obj].slots){
						var _slot:Object = new Object();
						_slot.name = objs;
						slotAnimation(_slot,data[obj].slots[objs]);
						_animation.slot.push(_slot);
					}
				}
				if(data[obj].hasOwnProperty("events")){
					_animation.frame = [];
					var isFirstEvent:Boolean = false;
					var evt:Object;
					for each(evt in data[obj].events){
						var events:Object = new Object();
						eventAnimation(events,evt);
						_animation.frame.push(events);
						if(evt.time == 0)
							isFirstEvent = true
					}
					if(!isFirstEvent){
						var e:Object = new Object();
						e.duration = 0;
						_animation.frame.push(e);
					}
					_animation.frame.sort(Compare);
					repairDuration(_animation.frame);
				}
				animation.push(_animation)
			}
		}
		private static function zOrderAnimation(_zOrder:Object,data:Object):void
		{
			_zOrder["tweenEasing"] = null;
			_zOrder["zOrder"] = [];
			if(data.hasOwnProperty("time")){
				_zOrder["duration"] = Math.round(data["time"] * SPINE_FRAME);
			}
			if(data.hasOwnProperty("offsets")){
				for each (var obj:Object in data["offsets"]) 
				{
					_zOrder["zOrder"].push(getZOrderBySlotName(obj["slot"]));
					_zOrder["zOrder"].push(obj["offset"]);
				}
			}
		}
		private static function getZOrderBySlotName(slotName:String):int
		{
			for (var i:int = 0; i < armatureSlot.length; i++) 
			{
				if(armatureSlot[i]["name"] == slotName)
				{
					return i
				}
			}
			return 0;
		}
		private static function boneAnimation(_bone:Object,data:Object):void
		{
			_bone.frame = [];
			var _frame:Object;
			var obj:Object;
			var hasFirstFrame:Boolean = false;
			if(data.hasOwnProperty("rotate")){
				for each(obj in data.rotate){
					_frame = new Object();
					_bone.frame.push(_frame);
					if(obj.hasOwnProperty("time"))
						_frame.duration = Math.round(obj.time * SPINE_FRAME);
					if(obj.hasOwnProperty("angle")){
						if(!_frame.transform)
							_frame.transform = new Object;
						_frame.transform.skX = -obj.angle;
						_frame.transform.skY = -obj.angle;
					}
					addCurveToDB(_frame,obj);
					/*if(_frame.tweenEasing && _frame.tweenEasing == "0"){
					}else{
					_frame.tweenEasing = "0";
					if(obj.hasOwnProperty("curve") && obj.curve == "stepped"){
					_frame.tweenEasing = "NaN";
					}
					}*/
					if(_frame.duration == 0){
						hasFirstFrame = true;
					}
				}
				if(!hasFirstFrame){
					hasFirstFrame  = true;
					_frame = new Object();
					_frame.duration = 0;
					addCurveToDB(_frame,obj);
					_bone.frame.push(_frame);
				}
			}
			var flag:Number = -1;
			if(data.hasOwnProperty("translate")){
				for each(obj in data.translate){
					if(obj.hasOwnProperty("time"))
						flag = getFrameForTime(_bone, Math.round(obj.time * SPINE_FRAME));
					if(flag<0){
						_frame = new Object();
						_bone.frame.push(_frame);
						if(obj.hasOwnProperty("time"))
							_frame.duration =  Math.round(obj.time*SPINE_FRAME);
					}else{
						_frame = _bone.frame[flag];
					}
					if(obj.hasOwnProperty("x")){
						if(!_frame.transform)
							_frame.transform = new Object;
						_frame.transform.x = obj.x;
					}
					if(obj.hasOwnProperty("y")){
						if(!_frame.transform)
							_frame.transform = new Object;
						_frame.transform.y = -obj.y;
					}
					addCurveToDB(_frame,obj);
					if(_frame.duration == 0){
						hasFirstFrame = true;
					}
				}
				if(!hasFirstFrame){
					hasFirstFrame  = true;
					_frame = new Object();
					_frame.duration = 0;
					addCurveToDB(_frame,obj);
					_bone.frame.push(_frame);
				}
			}
			flag = -1
			if(data.hasOwnProperty("scale")){
				for each(obj in data.scale){
					if(obj.hasOwnProperty("time"))
						flag = getFrameForTime(_bone, Math.round(obj.time * SPINE_FRAME));
					if(flag<0){
						_frame = new Object();
						_bone.frame.push(_frame);
						if(obj.hasOwnProperty("time"))
							_frame.duration =  Math.round(obj.time*SPINE_FRAME);
					}else{
						_frame = _bone.frame[flag];
					}
					if(obj.hasOwnProperty("x")){
						if(!_frame.transform)
							_frame.transform = new Object();
						_frame.transform.scX = obj.x;
					}
					if(obj.hasOwnProperty("y")){
						if(!_frame.transform)
							_frame.transform = new Object();
						_frame.transform.scY = obj.y;
					}
					addCurveToDB(_frame,obj);
					if(_frame.duration == 0){
						hasFirstFrame = true;
					}
				}
				if(!hasFirstFrame){
					hasFirstFrame  = true;
					_frame = new Object();
					_frame.duration = 0;
					addCurveToDB(_frame,obj);
					_bone.frame.push(_frame);
				}
			}
			_bone.frame.sort(Compare);
			repairDuration(_bone.frame);
		}
		/**将从小到大的递增数设置为逐级差值**/
		private static function repairDuration(frame:Array):void
		{
			for(var i:int = 0;i<frame.length-1;i++){
				Object(frame[i]).duration = Object(frame[i+1]).duration - Object(frame[i]).duration;
			}
			Object(frame[frame.length-1]).duration = 0;
			//补全由Spine三条时间轴引起的DB单轴的数据差错。（并为完全意义上的修复，只是稍微减少一下差错）
			var tempX:Number = 0;
			var tempY:Number = 0;
			var tempskX:Number = 0;
			var tempskY:Number = 0;
			var tempscX:Number = 1;
			var tempscY:Number = 1;
			var tempFrame:Object = {};
			for (var j:int = 0; j < frame.length; j++)
			{
				tempFrame = frame[j];
				if(tempFrame.hasOwnProperty("transform")){
					if(tempFrame["transform"].hasOwnProperty("x")){
						tempX = tempFrame["transform"]["x"];
					}else{
						tempFrame["transform"]["x"] = tempX;
					}
					if(tempFrame["transform"].hasOwnProperty("y")){
						tempY = tempFrame["transform"]["y"];
					}else{
						tempFrame["transform"]["y"] = tempY;
					}
					if(tempFrame["transform"].hasOwnProperty("skX")){
						tempskX = tempFrame["transform"]["skX"];
					}else{
						tempFrame["transform"]["skX"] = tempskX;
					}
					if(tempFrame["transform"].hasOwnProperty("skY")){
						tempskY = tempFrame["transform"]["skY"];
					}else{
						tempFrame["transform"]["skY"] = tempskY;
					}
					if(tempFrame["transform"].hasOwnProperty("scX")){
						tempscX = tempFrame["transform"]["scX"];
					}else{
						tempFrame["transform"]["scX"] = tempscX;
					}
					if(tempFrame["transform"].hasOwnProperty("scY")){
						tempscY = tempFrame["transform"]["scY"];
					}else{
						tempFrame["transform"]["scY"] = tempscY;
					}
				}
			}
		}
		/**排序，按时间顺序**/
		private static function Compare(paraA:Object,paraB:Object):int  
		{  
			var durationA:int = paraA.duration ;  
			var durationB:int = paraB.duration ;  
			if(durationA>durationB)  
			{  
				return 1;  
			}  
			else if(durationA<durationB)  
			{  
				return -1;  
			}  
			else  
			{  
				return 0;  
			}  
		}  
		/**获取同时间点的Frame**/
		private static function getFrameForTime(_bone:Object,times:Number):Number{
			var flag:Number = -1;
			for(var i:int=0;i<_bone.frame.length;i++){
				if(_bone.frame[i].duration == times)
					flag = i;
			}
			return flag;
		}
		private static function ffdAnimation(ffd:Array,data:Object):void
		{
			for (var fd:String in data) 
			{
				for(var fdname:String in data[fd]){
					var _ffd:Object = new Object();
					_ffd.slot = fd;
					_ffd.skin = "";
					_ffd.scale = 1;
					_ffd.offset = 0;
					_ffd.frame = [];
					_ffd.name = fdname;
					fddFrameAnimation(_ffd.frame,data[fd][fdname],getWeightedMesh(fdname))
					repairDuration(_ffd.frame);
					ffd.push(_ffd)
				}
			}
		}
		private static function getWeightedMesh(name:String):Object
		{
			if(weightedMesh.hasOwnProperty(name)){
				return weightedMesh[name];
			}
			return {}
		}
		private static function fddFrameAnimation(fddFrame:Array,data:Object,weightMeshObj:Object):void
		{
			var bbw:Array = [];//{0,[{1,0.6},{2,0.4}]}
			if(weightMeshObj.hasOwnProperty("bonePose")){
				//var bnum:Array = [];//每个点对应的权重骨骼占比
				var nn:int = 0;
				var bn:int=0;
				while(weightMeshObj.weights && weightMeshObj.weights[nn]){
					bn = weightMeshObj.weights[nn];
					//bnum.push(bn);
					var boneL:Array = [];
					for (var k:int = nn+1; k < nn+1+(2*bn); k++) 
					{
						var bb:Object = new Object();
						bb.id = weightMeshObj.weights[k];
						bb.we = weightMeshObj.weights[k+1];
						boneL.push(bb);
						k++;
					}
					bbw.push(boneL);
					nn += 1+(2*bn);
				}
			}
			var hasFirstFrame:Boolean = false;
			for each (var frame:Object in data) 
			{
				var ffdFrame:Object =new  Object();
				var temp:Number = 0;
				if(frame.hasOwnProperty("time")){
					ffdFrame.duration =  Math.round(frame.time * SPINE_FRAME);
				}
				if(frame.hasOwnProperty("vertices")){
					ffdFrame.vertices = [];
					if(bbw.length>0){//顶点中有数据权重
						transFfdFrameWeigthMesh(ffdFrame,frame,bbw);
					}else{
						if(frame.hasOwnProperty("offset")){
							ffdFrame.offset = frame.offset;
							temp = ffdFrame.offset;
						}
						ffdFrame.vertices = frame.vertices;
						for (var i:int = 0; i < ffdFrame.vertices.length; i++) 
						{
							if(temp%2 == 1){
								ffdFrame.vertices[i] = -ffdFrame.vertices[i];
								i++;
							}else{
								i++;
								ffdFrame.vertices[i] = -ffdFrame.vertices[i];
							}
						}
					}
				}
				addCurveToDB(ffdFrame,frame)
				if(ffdFrame.duration == 0){
					hasFirstFrame = true;
				}
				fddFrame.push(ffdFrame);
			}
			if(!hasFirstFrame){//如果没有第一帧，添加第一帧
				hasFirstFrame = true;
				var _frame:Object = new Object();
				_frame.duration = 0;
				fddFrame.push(_frame);
			}
			fddFrame.sort(Compare);
		}
		private static function transFfdFrameWeigthMesh(ffdFrame:Object,frame:Object,ffdWeightList:Array):void
		{
			var  bnum:int = ffdWeightList.length;
			ffdFrame.vertices = [];
			var offset:int = 0;
			if(frame.hasOwnProperty("offset")){
				//补全
				for(var l:int = 0;l<frame.offset;l++)
				{
					frame.vertices.unshift(0);
				}
				//offset = getMeshOffect(frame.offset,boneWeightList);
			}
			ffdFrame.offset = 0;//offset
			//var tt:int = 0;//序号
			/*if(offset/2){
				tt = offset/2
			}*/
			var ffdWeight:Array = [];
			for (var j:int = 0; j < bnum; j++) 
			{
				ffdWeight.push(frame.vertices.splice(0,ffdWeightList[j].length*2));
			}
			
			for (var i:int = 0; i < ffdWeight.length; i++) 
			{
				var po:Point = getVerticesMoreBone(ffdWeight[i],ffdWeightList[i]);
				ffdFrame.vertices.push(po.x);//x坐标
				ffdFrame.vertices.push(po.y);//坐标 
			}
		}
		private static function getVerticesMoreBone(ffdWeight:Array,ffdWeightList:Array):Point
		{
			var point:Point = new Point();
			var temx:Number = 0;
			var temy:Number = 0;
			var p:Point = new Point();
			for (var i:int = 0; i < ffdWeight.length; i = i+2) 
			{
				trace("使用的矩阵id是",ffdWeightList[i/2]["id"])
				var bmatrix:Matrix = getBoneMatrix(ffdWeightList[i/2]["id"]).clone();
				/*var db:DBTransform = new DBTransform();
				DBTransformUtil.matrixToTransform(bmatrix,db,true,true);
				//db.scaleX = db.scaleY = 1;
				DBTransformUtil.transformToMatrix(db,bmatrix);*/
			//bmatrix.deltaTransformPoint(
				bmatrix.tx = bmatrix.ty = 0;
				p.x = ffdWeight[i];
				p.y = -ffdWeight[i+1];
				//p = bmatrix.deltaTransformPoint(p);
				p = bmatrix.transformPoint(p);
				if(ffdWeight[i] != 0)
					point.x += ffdWeightList[i/2]["we"]*p.x;
				if(ffdWeight[i+1] != 0)
					point.y += ffdWeightList[i/2]["we"]*p.y;
			}
			return point;
		}
		private static function getMeshOffect(offect:int,bnum:Array):int
		{
			var temp:int = 0;
			for (var i:int = 0; i < bnum.length; i++) 
			{
				temp += bnum[i].length*2
				if(temp >= offect){
					return (i+1)*2
				}
			}
			return bnum.length*2;
		}
		private static function getBonePostion():void//根据每个骨骼所占的权重值得到准确的xy坐标
		{
			
		}
		private static function slotAnimation(_slot:Object,data:Object):void
		{
			var obj:Object
			var _frame:Object
			var hasFirstFrame:Boolean = false;
			if(data.hasOwnProperty("attachment")){
				_slot.frame = [];
				for each( obj in data.attachment){
					_frame = new Object();
					if(obj.hasOwnProperty("time"))
						_frame.duration =  Math.round(obj.time * SPINE_FRAME);
					if(obj.hasOwnProperty("name")){//如果有这个参数，设置为对应的图片或者不显示，如果没有，去slotArmatureSlot找默认值
						if(obj.name)//如果有参数，不是正常图片，就是null，如果为null，则不显示
							_frame.displayIndex = displayIndexObject[obj.name];
						else
							_frame.displayIndex = -1;
					}
					addCurveToDB(_frame,obj);
					_slot.frame.push(_frame);
					if(_frame.duration == 0){
						hasFirstFrame = true;
					}
				}
				if(!hasFirstFrame){//如果没有第一帧，添加第一帧
					hasFirstFrame = true;
					_frame = new Object();
					_frame.duration = 0;
					addCurveToDB(_frame,obj);
					//检测slot中slot.name的displayIndex
					for each(var oo:Object in armatureSlot){
						if(oo.name == _slot.name){
							if(oo.hasOwnProperty("displayIndex"))
								_frame.displayIndex = oo.displayIndex;//如果运动中spine的第一帧取slotArnature默认值。
							else
								_frame.displayIndex = 0;
						}
					}
					/*if(!_frame.displayIndex){
					_frame.displayIndex = -1;//displayIndexObject[0];//没有找到的话，取-1，理论上这个地方是走不到的
					}*/
					_slot.frame.push(_frame);
				}
			}
			
			var flag:Number = -1;
			if(data.hasOwnProperty("color")){
				if(!_slot.frame)
					_slot.frame = [];
				for each(obj in data.color){
					if(obj.hasOwnProperty("time"))
						flag = getFrameForTime(_slot, Math.round(obj.time * SPINE_FRAME));
					if(flag<0){
						_frame = new Object();
						_slot.frame.push(_frame);
						if(obj.hasOwnProperty("time"))
							_frame.duration =  Math.round(obj.time*SPINE_FRAME);
					}else{
						_frame = _slot.frame[flag];
					}
					addCurveToDB(_frame,obj);
					if(_frame.duration == 0){
						hasFirstFrame = true;
					}
					if(obj.hasOwnProperty("color")){
						if(!_frame.color)
							_frame.color = new Object();
						_frame.color = changeColorToDB(obj.color);
					}
				}
				if(!hasFirstFrame){//如果没有第一帧，添加第一帧
					hasFirstFrame = true;
					_frame = new Object();
					_frame.duration = 0;
					addCurveToDB(_frame,obj);
					//检测slot中slot.name的displayIndex
					for each(var ood:Object in armatureSlot){
						if(ood.name == _slot.name){
							if(ood.hasOwnProperty("displayIndex"))
								_frame.displayIndex = ood.displayIndex;//如果运动中spine的第一帧取slotArnature默认值。
							else
								_frame.displayIndex = 0;
						}
					}
					/*if(!_frame.displayIndex){
					_frame.displayIndex = -1;//displayIndexObject[0];//没有找到的话，取-1，理论上这个地方是走不到的
					}*/
					_slot.frame.push(_frame);
				}
			}
			_slot.frame.sort(Compare);
			repairDuration(_slot.frame);
		}
		private static function eventAnimation(_event:Object,data:Object):void
		{
			if(data.hasOwnProperty("name"))
				_event.event = data.name;
			if(data.hasOwnProperty("time"))
				_event.duration =  Math.round(data.time * SPINE_FRAME);
		}
		private static function changeColorToDB(colorString:String):Object
		{
			var _color:Object = new Object();
			var arr:Array = [];
			for(var i:int = 0; i<colorString.length;i++)
			{
				if(i%2 == 0)
					arr.push(parseInt(colorString.substr(i,2),16));
			}
			_color.rM = (arr[0]/255)*100;
			_color.gM = (arr[1]/255)*100;
			_color.bM = (arr[2]/255)*100;
			_color.aM = (arr[3]/255)*100;
			return _color;
		}
		private static function addCurveToFrame(_frame:Object,_curve:Array):void
		{
			if(_frame.curve){
				_frame.curve = getTwoCurveAverage(_frame.curve,_curve);
			}else{
				_frame.curve = _curve;
			}
		}
		private static function addCurveToDB(_frame:Object,obj:Object):void
		{
			if(obj.hasOwnProperty("curve")){
				if(obj.curve == "stepped"){
					if (!_frame.tweenEasing) 
					{
						_frame.tweenEasing = "NaN";
					}
				}else{
					addCurveToFrame(_frame,obj.curve);
				}
			}else{
				//spine没有值，就是直线
				addCurveToFrame(_frame,[0,0,1,1]);
				if (!_frame.tweenEasing) 
				{
					_frame.tweenEasing = 0;
				}
			}
			/*if(_frame.tweenEasing && _frame.tweenEasing != "NaN"){
			if(obj.hasOwnProperty("curve")){
			if(obj.curve == "stepped"){
			}else{
			_frame.tweenEasing = getTwoCurveAverage(_frame.tweenEasing,obj.curve);
			}
			}
			}else{
			_frame.tweenEasing = "NaN";
			if(obj.hasOwnProperty("curve")){
			if(obj.curve == "stepped"){
			_frame.tweenEasing = "NaN";
			}else{
			_frame.tweenEasing = obj.curve;
			}
			}
			}*/
		}
		private static function getTwoCurveAverage(curve1:Array,curve2:Array):Array
		{
			var _curve:Array = new Array();
			for(var i:int = 0;i<4;i++){
				_curve[i] = (curve1[i]+curve2[i])/2
			}
			return _curve;
		}
		
		public static function spliceOutlineAndUserEdge(hull:int, edges:Array, uv:Array, width:int, height:int):Object
		{
			var leftIndex:int = -1;
			var rightIndex:int = -1;
			var topIndex:int = -1;
			var bottomIndex:int = -1;
			var i:int;
			var len:int;
			var leftMax:Number = Number.MAX_VALUE;
			var rightMax:Number = -Number.MAX_VALUE;
			var topMax:Number = -Number.MAX_VALUE;
			var bottomMax:Number = Number.MAX_VALUE;
			var allCircle:Array;
			var outline:Array;
			var points:Array = [];
			var halfW:Number = width / 2;
			var halfH:Number = height / 2;
			
			for (i = 0, len = uv.length; i < len; i += 2)
			{
				points.push(width * uv[i] - halfW);
				points.push(height * uv[i + 1] - halfH);
			}
			
			//找到上下左右四个点的位置，这四个点肯定是边界上的点
			for (i = 0, len = points.length; i < len; i+=2)
			{
				if (points[i] < leftMax)
				{
					leftIndex = i / 2;
					leftMax = points[i];
				}
				if (points[i] > rightMax)
				{
					rightIndex = i / 2;
					rightMax = points[i];
				}
				if (points[i + 1] > topMax)
				{
					topIndex = i / 2;
					topMax = points[i + 1];
				}
				if (points[i + 1] < bottomMax)
				{
					bottomIndex = i / 2;
					bottomMax = points[i + 1];
				}
			}
			//找到最左边的点作为起点
			var p0:int = leftIndex;
			var lastAngle:Number;
			var p1Edge:Array = getNextEdges(p0, p0, edges, points, 0);
			
			var p1:int = -1;
			if (p1Edge[0] == p0)
			{
				p1 = p1Edge[1];
			}
			else
			{
				p1 = p1Edge[0];
			}
			lastAngle = p1Edge[2];
			lastAngle -= Math.PI;
			if (lastAngle < 0)
			{
				lastAngle += Math.PI * 2;
			}
			if (p0 >= 0 && p1 >= 0) 
			{
				outline = [];
				outline.push(p0, p1);
				var hasFind:Boolean;
				var nextEdge:Array = getNextEdges(p0, p1, edges, points, lastAngle);
				while (nextEdge && nextEdge.length == 3)
				{
					outline.push(nextEdge[0], nextEdge[1]);
					if (nextEdge[1] == outline[0] && outline.length == hull)
					{
						hasFind = true;
						break;
					}
					else if (outline.length >= hull)
					{
						break;
					}
					lastAngle = nextEdge[2];
					lastAngle -= Math.PI;
					if (lastAngle < 0)
					{
						lastAngle += Math.PI * 2;
					}
					nextEdge = getNextEdges(nextEdge[0], nextEdge[1], edges, points, lastAngle);
				}
				if (hasFind)
				{
					for (i = 0, len = outline.length; i < len; i+= 2)
					{
						removePointFromEdges(edges, outline[i], outline[i+1]);
					}
					return { outline:outline, userEdges:edges};
				}
				
			}
			return null;
		}
		private static function getNextEdges(p0:int, p1:int, allEdges:Array, points:Array, lastAngle:Number):Array
		{
			var edges:Array = getConnectEdges(p0, p1, allEdges);
			var point0:Point = new Point();
			var point1:Point = new Point();
			var p0Index:int;
			var p1Index:int;
			
			var maxAngle:Number = 10000;
			var angle:Number;
			var originAngle:Number;
			var nextEdge:Array = [];
			
			for (var i:int = 0, len:int = edges.length; i < len; i += 2)
			{
				p0Index = edges[i];
				p1Index = edges[i + 1];
				point0.x = points[p0Index * 2];
				point0.y = points[p0Index * 2 + 1];
				point1.x = points[p1Index * 2];
				point1.y = points[p1Index * 2 + 1];
				angle = getAngle(point0, point1);
				originAngle = angle;
				angle -= lastAngle;
				if (angle < 0)
				{
					angle += Math.PI * 2;
				}
				if (angle < maxAngle)
				{
					maxAngle = angle;
					nextEdge[0] = p0Index;
					nextEdge[1] = p1Index;
					nextEdge[2] = originAngle;
				}
			}
			return nextEdge;
		}
		
		private static function getAngle(p0:Point, p1:Point):Number
		{
			var a:Number = p1.x - p0.x;
			var b:Number = p1.y - p0.y;
			
			var angle:Number = Math.atan2(a,b);
			if (angle < 0)
			{
				angle += Math.PI * 2;
			}
			
			return angle;
		}
		private static function getConnectEdges(p0:int, p1:int, edges:Array):Array
		{
			var i:int;
			var len:int;
			var x:int;
			var y:int;
			var connectEdges:Array = [];
			
			for (i = 0, len = edges.length / 2; i < len; i++)
			{
				x = edges[i * 2];
				y = edges[i * 2 + 1];
				if ((x == p0 && y == p1) || ( x == p1 && y == p0)) 
				{
					continue;
				}
				if (x == p1)
				{
					connectEdges.push(x, y);
				}
				else if ( y == p1)
				{
					connectEdges.push(y, x);
				}
			}
			return connectEdges;
		}
		private static function getEdgeIndex(edges:Array, p0:int, p1:int):int
		{
			var index:int = -1;
			for (var i:int = 0, len:int = edges.length; i < len; i += 2)
			{
				if ((edges[i] == p0 && edges[i + 1] == p1) ||
					(edges[i] == p1 && edges[i + 1] == p0))
				{
					index = i;
					break;
				}
			}
			return index;
		}
		private static function removePointFromEdges(edges:Array, p0:int, p1:int):void
		{
			var index:int = getEdgeIndex(edges, p0, p1);
			if (index >= 0)
			{
				edges.splice(index, 2);
			}
		}
		
		private static function createBoneList(_boneList:Array):void
		{
			boneList.length = 0;
			var i:int = 0
			for (i = 0; i < _boneList.length; i++) 
			{ 
				var bone:Object = new Object();
				bone.name = _boneList[i].name;
				if(_boneList[i].hasOwnProperty("parent"))
					bone["pp"] = _boneList[i]["parent"];
				var trans:DBTransform = new DBTransform();
				if(_boneList[i].hasOwnProperty("transform")){
					if(_boneList[i]["transform"].hasOwnProperty("skX")){
						trans.skewX = _boneList[i]["transform"]["skX"];
					} 
					if(_boneList[i]["transform"].hasOwnProperty("skY")){
						trans.skewY = _boneList[i]["transform"]["skY"];
					}
					if(_boneList[i]["transform"].hasOwnProperty("x"))
						trans.x = _boneList[i]["transform"]["x"];
					if(_boneList[i]["transform"].hasOwnProperty("y"))
						trans.y = _boneList[i]["transform"]["y"];
					if(_boneList[i]["transform"].hasOwnProperty("scX"))
						trans.scaleX = _boneList[i]["transform"]["scX"];
					if(_boneList[i]["transform"].hasOwnProperty("scY"))
						trans.scaleY = _boneList[i]["transform"]["scY"];
				}
				bone.transform = trans;
				boneList.push(bone);
			}
			for (i = 0; i < boneList.length; i++) 
			{
				if(boneList[i]["pp"])
				{
					setBoneParent(boneList[i],boneList[i]["pp"]);
				}
			}
			setBoneTransform();
		}
		private static function setBoneParent(bone:Object,parent:String):void
		{
			for each (var i:Object in boneList) 
			{
				if(i.name == parent)
				{
					bone["parent"] = i;
				}
			}
		}
		private static function setBoneTransform():void
		{
			boneMatrix.length = 0;
			for (var i:int = 0; i < boneList.length; i++) 
			{
				var pp:Object = boneList[i];
				pp.matrix = createMatrix(pp.transform);
				if(pp.parent){
					Matrix(pp.matrix).concat(pp.parent.matrix);
					//pp.transform.add(pp.parent.transform); 
				}
				//pp.matrix = createMatrix(pp.transform);
				boneMatrix[i] = pp.matrix;
			}
		}
		/*private static function parseSpine(data:Object):void
		{
			//计算骨骼的globalMatrix；
			getBoneGlobalMatrix(data);
			// 调整spine数据
			var i:int;
			var len:int;
			var j:int;
			var jLen:int;
			var displayObj:Object;
			var k:int;
			var kLen:int;
			
			for (i = 0, len = data.armature[0].skin[0].slot.length; i < len; i++)
			{
				for (j = 0, jLen = data.armature[0].skin[0].slot[i].display.length; j < jLen; j++)
				{
					displayObj = data.armature[0].skin[0].slot[i].display[j];
					if (displayObj.type == "weightedmesh")
					{
						for (k = 0, kLen = displayObj.vertices.length; k < kLen; k++)
						{
							if (k % 2 == 1)
							{
								displayObj.vertices[k] = -displayObj.vertices[k];
							}
						}
					}
				}
			}
			//修正display的数据为db格式
			for (i = 0, len = data.armature[0].skin[0].slot.length; i < len; i++)
			{
				for (j = 0, jLen = data.armature[0].skin[0].slot[i].display.length; j < jLen; j++)
				{
					displayObj = data.armature[0].skin[0].slot[i].display[j];
					if (displayObj.type == "weightedmesh")
					{
						parseSkinedmesh(displayObj);
					}
				}
			}
		}*/
		private static var boneMatrix:Vector.<Matrix> = new Vector.<Matrix>();
		
		//计算骨骼的globalMatrix
		/*private static function getBoneGlobalMatrix(data:Object):void
		{
			var i:int;
			var len:int;
			var boneObj:Object;
			
			for (i = 0, len = data.armature[0].bone.length; i < len; i++)
			{
				boneObj = data.armature[0].bone[i];
				boneObj.matrix = createMatrix(boneObj.transform);
				boneMatrix[i] = boneObj.matrix;
			}
		}*/
		
		private static function createMatrix(transform:Object):Matrix
		{
			var dbTransform:DBTransform = new DBTransform();
			if (transform)
			{
				dbTransform.x = transform.x ? transform.x : 0;
				dbTransform.y = transform.y ? transform.y : 0;
				dbTransform.skewX = transform.skewX ? transform.skewX * (Math.PI / 180) : 0;
				dbTransform.skewY = transform.skewY ? transform.skewY * (Math.PI / 180) : 0;
				dbTransform.scaleX = transform.scaleX ? transform.scaleX : 1;
				dbTransform.scaleY = transform.scaleY ? transform.scaleY : 1;
			}
			var m:Matrix = new Matrix();
			DBTransformUtil.transformToMatrix(dbTransform, m);
			return m;
		}
		private static function createWeightedMeshData(displayObj:Object,verticesList:Array):void
		{
			var dbVertices:Array = [];
			var spineVertices:Array = verticesList;
			var numBone:int;
			var len:int;
			var weights:Array = [];
			var i:int;
			var k:int;
			var kLen:int;
			var bbList:Array = [];
			
			for ( i = 0, len = spineVertices.length; i < len; )
			{
				numBone = spineVertices[i];
				weights.push(numBone);
				for (k = i + 1; k < (i + numBone * 4 + 1); k += 4)
				{
					weights.push(spineVertices[k]);
					if(bbList.indexOf(spineVertices[k]) == -1){
						bbList.push(spineVertices[k]);
					}
					weights.push(spineVertices[k + 3]);
				}
				i += numBone * 4 + 1;
			}
			
			while (spineVertices.length > 0)
			{
				numBone = spineVertices[0];
				len = numBone * 4 + 1;
				var arr:Array = spineVertices.splice(0, len);
				var p:Point = getVertex(arr);
				dbVertices.push(p.x, p.y);
			}
			displayObj.type = "mesh";
			displayObj.vertices = dbVertices;
			displayObj.bonePose = getBonePose(bbList);
			displayObj.slotPose = [1, 0, 0, 1, 0, 0];
			displayObj.weights = weights;
		}
		
		private static function getVertex(arr:Array):Point
		{
			var i:int;
			var len:int;
			var boneMatrix:Matrix;
			var w:Number;
			var p:Point = new Point();
			var vertex:Point = new Point();
			for (i = 1, len = arr.length; i < len; i += 4)
			{
				boneMatrix = getBoneMatrix(arr[i]);
				p.x = arr[i + 1];
				p.y = -arr[i + 2];
				w = arr[i + 3];
				p = boneMatrix.transformPoint(p);
				vertex.x += p.x * w;
				vertex.y += p.y * w;
			}
			return vertex;
		}
		private static function getBoneMatrix(index:int):Matrix
		{
			return boneMatrix[index];
		}
		private static function getBonePose(bbList:Array):Array
		{
			var a:Array = [];
			var i:int;
			var len:int;
			var bNum:int;
			for (i = 0, len = bbList.length; i < len; i++)
			{
				bNum = bbList[i]
				a.push(bNum, boneMatrix[bNum].a, boneMatrix[bNum].b, boneMatrix[bNum].c, boneMatrix[bNum].d, boneMatrix[bNum].tx, boneMatrix[bNum].ty);
			}
			return a;
		}
		
	}
}