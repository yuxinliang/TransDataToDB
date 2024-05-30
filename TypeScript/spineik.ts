/**
 * Created by Yuxin on 2015/8/11.
 */
class main extends DBImportTemplate
{
    public dataFileExtension()
    {
        return ["Json"]
    }
    public dataFileDescription()
    {
        return "Spine data"
    }
    public textureAtlasDataFileExtension()
    {
        return ["atlas","texture"]
    }
    public isSupportTextureAtlas()
    {
        return true
    }
    public convertToDBTextureAtlasData(data)
    {
        var dbTexture = {};
        try{
            var arr = data.split("\n")
            for (var i = 0; i < arr.length; i++)
            {
                if(arr[i] == "" || arr[i] == "\r")
                {
                    arr.splice(i,1);
                }
            }
            for (var k = 0; k < arr.length; k++)
            {
                arr[k] = arr[k].replace("\r","");
            }
            dbTexture["imagePath"] = arr[0];
            dbTexture["SubTexture"] = [];
            var imageArr = arr.slice(5)
            for (var j = 0; j < imageArr.length;)
            {
                var image = {};
                image["name"] = imageArr[j];
                var rota = imageArr[j+1];
                rota = rota.slice(10);
                if(rota == "true"){
                    image["rotated"] = rota;
                }
                var xy= imageArr[j+2];
                xy = xy.slice(5);
                var aa = xy.split(",");
                image["x"] = aa[0];
                image["y"] = aa[1];
                var size= imageArr[j+3];
                size = size.slice(7);
                aa = size.split(",");
                image["width"] = aa[0];
                image["height"] = aa[1];
                j+=7;
                dbTexture["SubTexture"].push(image);
            }
        }catch(e){

        }
        return JSON.stringify(dbTexture)
    }
    public checkDataValid(spineJson)
    {
        var data = JSON.parse(spineJson);
        if(data["skeleton"] && data["skeleton"]["spine"]){
            return true;
        }
        return false;
    }
    public convertToDBData(spineJson)
    {
        var DBJson = {};
        try{
            var data = JSON.parse(spineJson);
            DBJson["name"] = "dataName";
            DBJson["version"] = "4.0";
            DBJson["frameRate"] = 30;
            DBJson["isGlobal"] = 0;
            DBJson["armature"] = [];
            for (var i = 0; i < 1; i++) {
                var armature = {}
                armature["name"] = "armatureName";
                if (data.hasOwnProperty("skins")) {
                    armature["skin"] = [];
                    this.skinss(armature["skin"], data["skins"]);
                }
                if (data.hasOwnProperty("bones")) {
                    armature["bone"] = [];
                    this.boneArmature(armature["bone"], data["bones"])
                }
                if (data.hasOwnProperty("ik")) {
                    armature["ik"] = data["ik"];
                }
                if (data.hasOwnProperty("slots")) {
                    armature["slot"] = [];
                    this.armatureSlot = [];
                    this.armatureSlot = armature["slot"];
                    this.slotArmature(armature["slot"], data["slots"]);
                }
                if(data.hasOwnProperty("animations")){
                    armature["animation"] = [];
                    this.animation(armature["animation"],data["animations"],data["bones"]);
                }
                DBJson["armature"].push(armature);
            }
        }catch(e){

        }
        return JSON.stringify(DBJson)
    }
    private armatureSlot = [];
    private skinss(skin, data) {
        var _skin = {};
        _skin["name"] = "";
        _skin["slot"] = [];
        for (var obj in data) {
            this.slotSkin( _skin["slot"], data[obj])
        }
        skin.push(_skin)
    }
    private slotSkin(slot, data) {
        var oo:any
        var flag = false;
        for (var objs in data) {
            for (oo in slot) {
                if (oo["name"] == objs) {
                    flag = true;
                    continue;
                }
            }
            if (flag)
                continue;
            var _slot = {};
            _slot["name"] = objs;
            _slot["display"] = [];
            this.displaySlotSkin(_slot["display"], data[objs], objs)
            slot.push(_slot);
        }
    }
    private displayIndexObject = {};
    private displaySlotSkin(display, data, objs) {
        var i = -1;
        for (var objss in data) {
            i++;
            this.displayIndexObject[objss] = i;
            var _display = {};
            if (data[objss]["name"])
                _display["name"] = data[objss]["name"];
            else
                _display["name"] = objss;
            _display["type"] = "image";
            if (data[objss].hasOwnProperty("scaleX")) {
                if (!_display["transform"]) {
                    _display["transform"] = {};
                }
                _display["transform"]["scX"] = data[objss]["scaleX"];
            }
            if (data[objss].hasOwnProperty("scaleY")) {
                if (!_display["transform"]) {
                    _display["transform"] = {};
                }
                _display["transform"]["scY"] = data[objss]["scaleY"];
            }
            if (data[objss].hasOwnProperty("x")) {
                if (!_display["transform"]) {
                    _display["transform"] = {};
                }
                _display["transform"]["x"] = data[objss]["x"];
            }
            if (data[objss].hasOwnProperty("y")) {
                if (!_display["transform"]) {
                    _display["transform"] = {};
                }
                _display["transform"]["y"] = -data[objss]["y"];
            }
            if (data[objss].hasOwnProperty("rotation")) {
                if (!_display["transform"]) {
                    _display["transform"] = {};
                }
                _display["transform"]["skX"] = -data[objss]["rotation"];
                _display["transform"]["skY"] = -data[objss]["rotation"];
            }
            display.push(_display);
        }
    }
    private boneArmature(bone, data) {
        for (var obj in data) {
            var _bone = {};
            if (data[obj].hasOwnProperty("name"))
                _bone["name"] = data[obj]["name"];
            if (data[obj].hasOwnProperty("parent"))
                _bone["parent"] = data[obj]["parent"];
            if (data[obj].hasOwnProperty("length"))
                _bone["length"] = data[obj]["length"];
            if (data[obj].hasOwnProperty("color"))
                _bone["color"] = data[obj]["color"];
            if (data[obj].hasOwnProperty("x")) {
                if (!_bone["transform"]) {
                    _bone["transform"] = {};
                }
                _bone["transform"]["x"] = data[obj]["x"];
            }
            if (data[obj].hasOwnProperty("y")) {
                if (!_bone["transform"]) {
                    _bone["transform"] = {};
                }
                _bone["transform"]["y"] = -data[obj]["y"];
            }
            if (data[obj].hasOwnProperty("rotation")) {
                if (!_bone["transform"]) {
                    _bone["transform"] = {};
                }
                _bone["transform"]["skX"] = -data[obj]["rotation"];
                _bone["transform"]["skY"] = -data[obj]["rotation"];
            }
            if (data[obj].hasOwnProperty("scale")) {
                if (!_bone["transform"]) {
                    _bone["transform"] = {};
                }
                _bone["transform"]["scX"] = 1;
                _bone["transform"]["scY"] = 1;
            }
            bone.push(_bone);
        }
    }
    private slotArmature(slot, data) {
        for (var obj in data) {
            var _solt = {};
            if (data[obj].hasOwnProperty("name"))
                _solt["name"] = data[obj]["name"];
            if (data[obj].hasOwnProperty("bone"))
                _solt["parent"] = data[obj]["bone"];
            if (data[obj].hasOwnProperty("attachment")) {
                if (this.displayIndexObject[data[obj]["attachment"]] != 0)
                    _solt["displayIndex"] = this.displayIndexObject[data[obj]["attachment"]];
            } else {
                _solt["displayIndex"] = -1;
            }
            slot.push(_solt);
        }
    }

    //动画部分 ----------------------------
    private animation(animation,data,bones)
    {
        for(var obj in data){
            var _animation = {};
            _animation["name"] = obj;
            //Spine中的数据还包含 drawOrder ，因DB不支持，故没做解析导入
            var boneTimelines = [];
            if(data[obj].hasOwnProperty("bones")){
                _animation["bone"] = [];
                for(var objb in data[obj]["bones"]){
                    var _bone = {};
                    _bone["name"] = objb;
                    this.boneAnimation(_bone,data[obj]["bones"][objb]);
                    _animation["bone"].push(_bone);
                    boneTimelines.push(_bone["name"]);
                }
                //for (var bone in bones)
                //{
                //    if (boneTimelines.indexOf(bone["name"]) == -1)
                //    {
                //        var tempBone = {};
                //        tempBone["name"] = bone["name"];
                //        tempBone["frame"] = []
                //        _animation["bone"].push(tempBone);
                //    }
                //}
            }

            if(data[obj].hasOwnProperty("slots")){
                _animation["slot"] = [];
                for(var objs in data[obj]["slots"]){
                    var _slot = {};
                    _slot["name"] = objs;
                    this.slotAnimation(_slot,data[obj]["slots"][objs]);
                    _animation["slot"].push(_slot);
                }
            }
            if(data[obj].hasOwnProperty("events")){
                _animation["frame"] = [];
                var isFirstEvent = false;

                for(var evt in data[obj]["events"]){
                    var events = {};
                    this.eventAnimation(events,data[obj]["events"][evt]);
                    _animation["frame"].push(events);
                    if(data[obj]["events"][evt]["time"] == 0)
                        isFirstEvent = true
                }
                if(!isFirstEvent){
                    var e = {};
                    e["duration"] = 0;
                    _animation["frame"].push(e);
                }
                _animation["frame"].sort(this.Compare);
                this.repairDuration(_animation["frame"]);
            }
            animation.push(_animation)
        }
    }
    private SPINE_FRAME = 30;
    private boneAnimation(_bone,data)
    {
        _bone["frame"] = [];
        var _frame = {};
        var hasFirstFrame = false;
        if(data.hasOwnProperty("rotate")){
            for(var obj in data["rotate"]){
                _frame = {};
                _bone["frame"].push(_frame);
                if(data["rotate"][obj].hasOwnProperty("time")){
                    _frame["duration"] = Math.round(Number(data["rotate"][obj]["time"]) * this.SPINE_FRAME);
                }
                if(data["rotate"][obj].hasOwnProperty("angle")){
                    if(!_frame["transform"])
                        _frame["transform"] = {};
                    _frame["transform"]["skX"] = -data["rotate"][obj]["angle"];
                    _frame["transform"]["skY"] = -data["rotate"][obj]["angle"];
                }
                this.addCurveToDB(_frame,data["rotate"][obj]);
                if(_frame["duration"] == 0){
                    hasFirstFrame = true;
                }
            }
            if(!hasFirstFrame){
                hasFirstFrame = true;
                _frame = {};
                _frame["duration"] = 0;
                this.addCurveToDB(_frame,{});
                _bone["frame"].push(_frame);
            }
        }
        var flag = -1;
        if(data.hasOwnProperty("translate")){
            for(var objl in data["translate"]){
                if(data["translate"][objl].hasOwnProperty("time"))
                    flag = this.getFrameForTime(_bone, Math.round(Number(data["translate"][objl]["time"]) * this.SPINE_FRAME));
                if(flag<0){
                    _frame = {};
                    _bone["frame"].push(_frame);
                    if(data["translate"][objl].hasOwnProperty("time")){
                        _frame["duration"] =  Math.round(Number(data["translate"][objl]["time"])*this.SPINE_FRAME);
                    }
                }else{
                    _frame = _bone["frame"][flag];
                }
                if(data["translate"][objl].hasOwnProperty("x")){
                    if(!_frame["transform"])
                        _frame["transform"] = {};
                    _frame["transform"]["x"] = data["translate"][objl]["x"];
                }
                if(data["translate"][objl].hasOwnProperty("y")){
                    if(!_frame["transform"])
                        _frame["transform"] = {};
                    _frame["transform"]["y"] = -data["translate"][objl]["y"];
                }
                this.addCurveToDB(_frame,data["translate"][objl]);
                if(_frame["duration"] == 0){
                    hasFirstFrame = true;
                }
            }
            if(!hasFirstFrame){
                hasFirstFrame = true;
                _frame = {};
                _frame["duration"] = 0;
                this.addCurveToDB(_frame,{});
                _bone["frame"].push(_frame);
            }
        }
        flag = -1
        if(data.hasOwnProperty("scale")){
            for(var objy in data["scale"]){
                if(data["scale"][objy].hasOwnProperty("time"))
                    flag = this.getFrameForTime(_bone, Math.round(Number(data["scale"][objy]["time"]) * this.SPINE_FRAME));
                if(flag<0){
                    _frame = {};
                    _bone["frame"].push(_frame);
                    if(data["scale"][objy].hasOwnProperty("time")){
                        _frame["duration"] =  Math.round(Number(data["scale"][objy]["time"])*this.SPINE_FRAME);
                    }
                }else{
                    _frame = _bone["frame"][flag];
                }
                if(data["scale"][objy].hasOwnProperty("x")){
                    if(!_frame["transform"])
                        _frame["transform"] = {};
                    _frame["transform"]["scX"] = data["scale"][objy]["x"];
                }
                if(data["scale"][objy].hasOwnProperty("y")){
                    if(!_frame["transform"])
                        _frame["transform"] = {};
                    _frame["transform"]["scY"] = data["scale"][objy]["y"];
                }
                this.addCurveToDB(_frame,data["scale"][objy]);
                if(_frame["duration"] == 0){
                    hasFirstFrame = true;
                }
            }
            if(!hasFirstFrame){
                hasFirstFrame = true;
                _frame = {};
                _frame["duration"] = 0;
                this.addCurveToDB(_frame,{});
                _bone["frame"].push(_frame);
            }
        }
        _bone["frame"].sort(this.Compare);
        this.repairDuration(_bone["frame"]);
    }
    private slotAnimation(_slot,data)
    {
        var _frame = {}
        var hasFirstFrame = false;
        if(data.hasOwnProperty("attachment")){
            _slot["frame"] = [];
            for( var obj in data["attachment"]){
                _frame = {};
                if(data["attachment"][obj].hasOwnProperty("time")){
                    _frame["duration"] =  Math.round(Number(data["attachment"][obj]["time"]) * this.SPINE_FRAME);
                }

                if(data["attachment"][obj].hasOwnProperty("name")){//如果有这个参数，设置为对应的图片或者不显示，如果没有，去slotArmatureSlot找默认值
                    if(data["attachment"][obj]["name"])//如果有参数，不是正常图片，就是null，如果为null，则不显示
                        _frame["displayIndex"] = this.displayIndexObject[data["attachment"][obj]["name"]];
                    else
                        _frame["displayIndex"] = -1;
                }
                this.addCurveToDB(_frame,data["attachment"][obj]);
                _slot["frame"].push(_frame);
                if(_frame["duration"] == 0){
                    hasFirstFrame = true;
                }
            }
            var flagC = -1
            if(!hasFirstFrame){//如果没有第一帧，添加第一帧
                hasFirstFrame = true;
                flagC = this.getFrameForTime(_slot, 0);
                if (flagC < 0) {
                    _frame = {};
                    _slot["frame"].push(_frame);
                    _frame["duration"] = 0;
                    this.addCurveToDB(_frame,{});
                }else{
                    _frame = _slot["frame"][flagC];
                }
                //检测slot中slot.name的displayIndex
                for(var oo = 0; oo< this.armatureSlot.length;oo++){
                    if(this.armatureSlot[oo]["name"] == _slot["name"]){
                        if(this.armatureSlot[oo].hasOwnProperty("displayIndex"))
                            _frame["displayIndex"] = this.armatureSlot[oo]["displayIndex"];//如果运动中spine的第一帧取slotArnature默认值。
                    }
                }
            }
        }

        var flag = -1;
        if(data.hasOwnProperty("color")){
            if(!_slot["frame"])
                _slot["frame"] = [];
            for(var objs in data["color"]) {
                if (data["color"][objs].hasOwnProperty("time"))
                    flag = this.getFrameForTime(_slot, Math.round(Number(data["color"][objs]["time"]) * this.SPINE_FRAME));
                if (flag < 0) {
                    _frame = {};
                    _slot["frame"].push(_frame);
                    if (data["color"][objs].hasOwnProperty("time")) {
                        _frame["duration"] = Math.round(Number(data["color"][objs]["time"]) * this.SPINE_FRAME);
                    }
                    //给_slot["frame"]做一次排序
                    _slot["frame"].sort(this.Compare);

                    //得到上一个关键帧
                    var perFrame = {};
                    for(var k = 0;k< _slot["frame"].length;k++){
                        if(_frame["duration"]>_slot["frame"][k]["duration"]){
                            perFrame = _slot["frame"][k];
                        }
                    }
                    //设置此帧的displayIndex
                    if(perFrame["duration"] == 0){
                        for(var kk = 0; kk< this.armatureSlot.length;kk++){
                            if(this.armatureSlot[kk]["name"] == _slot["name"]){
                                if(this.armatureSlot[kk].hasOwnProperty("displayIndex"))
                                    perFrame["displayIndex"] = this.armatureSlot[kk]["displayIndex"];//如果运动中spine的第一帧取slotArnature默认值。
                            }
                        }
                    }
                    if(perFrame.hasOwnProperty("displayIndex"))
                        _frame["displayIndex"] = perFrame["displayIndex"];

                } else {
                    _frame = _slot["frame"][flag];
                }
                this.addCurveToDB(_frame, data["color"][objs]);
                if (_frame["duration"] == 0) {
                    hasFirstFrame = true;
                }
                if (data["color"][objs].hasOwnProperty("color")) {
                    if (!_frame["color"])
                        _frame["color"] = {};
                    _frame["color"] = this.changeColorToDB(data["color"][objs]["color"]);
                }
            }
            var flagCD = -1
            if(!hasFirstFrame){//如果没有第一帧，添加第一帧
                hasFirstFrame = true;
                flagCD = this.getFrameForTime(_slot, 0);
                if (flagCD < 0) {
                    _frame = {};
                    _slot["frame"].push(_frame);
                    _frame["duration"] = 0;
                    this.addCurveToDB(_frame,{});
                }else{
                    _frame = _slot["frame"][flagCD];
                }
                //检测slot中slot.name的displayIndex
                for(var ood = 0; ood< this.armatureSlot.length;ood++){
                    if(this.armatureSlot[ood]["name"] == _slot["name"]){
                        if(this.armatureSlot[ood].hasOwnProperty("displayIndex"))
                            _frame["displayIndex"] = this.armatureSlot[ood]["displayIndex"];//如果运动中spine的第一帧取slotArnature默认值。
                    }
                }
            }
        }
        _slot["frame"].sort(this.Compare);
        this.repairDuration(_slot["frame"]);
    }
    private eventAnimation(_event,data)
    {
        if(data.hasOwnProperty("name"))
            _event["event"] = data["name"];
        if(data.hasOwnProperty("time")){
            _event["duration"] =  Math.round(Number(data["time"]) * this.SPINE_FRAME);
        }

    }


    private changeColorToDB(colorString)
    {
        var _color = {};
        var arr = [];
        for(var i = 0; i<colorString.length;i++)
        {
            if(i%2 == 0)
                arr.push(parseInt(colorString.substr(i,2),16));
        }
        _color["rM"] = (arr[0]/255)*100;
        _color["gM"] = (arr[1]/255)*100;
        _color["bM"] = (arr[2]/255)*100;
        _color["aM"] = (arr[3]/255)*100;
        return _color;
    }


    /**将从小到大的递增数设置为逐级差值**/
    private repairDuration(frame)
    {
        for(var i = 0;i<frame.length-1;i++){
            frame[i]["duration"] = frame[i+1]["duration"] - frame[i]["duration"];
        }
        frame[frame.length-1]["duration"] = 0;
    }
    /**排序，按时间顺序**/
    private Compare(paraA,paraB)
    {
        var durationA = paraA["duration"] ;
        var durationB = paraB["duration"] ;
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
    private getFrameForTime(_bone,times)
    {
        var flag = -1;
        for(var i=0;i<_bone["frame"].length;i++){
            if(_bone["frame"][i]["duration"] == times)
                flag = i;
        }
        return flag;
    }
    private addCurveToDB(_frame,obj)
    {
        if(obj.hasOwnProperty("curve")){
            if(obj["curve"] == "stepped"){
                if (!_frame["tweenEasing"])
                {
                    _frame["tweenEasing"] = "NaN";
                }
            }else{
                this.addCurveToFrame(_frame,obj["curve"]);
            }
        }else{
            //spine没有值，就是直线
            this.addCurveToFrame(_frame,[0,0,1,1]);
            if (!_frame["tweenEasing"])
            {
                _frame["tweenEasing"] = 0;
            }
        }
    }
    private addCurveToFrame(_frame,_curve){
        if(_frame["curve"]){
            _frame["curve"] = this.getTwoCurveAverage(_frame["curve"],_curve);
        }else{
            _frame["curve"] = _curve;
        }
    }
    private getTwoCurveAverage(curve1,curve2)
    {
        var _curve = [];
        for(var i = 0;i<4;i++){
            _curve[i] = (curve1[i]+curve2[i])/2
        }
        return _curve;
    }

}