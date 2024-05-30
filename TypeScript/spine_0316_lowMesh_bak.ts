/**
 * Created by Yuxin on 2015/8/11.
 */
class main extends DBImportTemplate {
    public dataFileExtension() {
        return ["Json"]
    }

    public dataFileDescription() {
        return "Spine data"
    }

    public textureAtlasDataFileExtension() {
        return ["atlas", "texture"]
    }

    public isSupportTextureAtlas() {
        return true
    }

    public convertToDBTextureAtlasData(data) {
        var dbTexture = {};
        try {
            var arr = data.split("\n")
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] == "" || arr[i] == "\r") {
                    arr.splice(i, 1);
                }
            }
            for (var k = 0; k < arr.length; k++) {
                arr[k] = arr[k].replace("\r", "");
            }
            dbTexture["imagePath"] = arr[0];
            dbTexture["SubTexture"] = [];
            var imageArr = arr.slice(5)
            for (var j = 0; j < imageArr.length;) {
                var image = {};
                image["name"] = imageArr[j];
                var rota = imageArr[j + 1];
                rota = rota.slice(10);
                if (rota == "true") {
                    image["rotated"] = rota;
                }
                var xy = imageArr[j + 2];
                xy = xy.slice(5);
                var aa = xy.split(",");
                image["x"] = aa[0];
                image["y"] = aa[1];
                var size = imageArr[j + 3];
                size = size.slice(7);
                aa = size.split(",");
                image["width"] = aa[0];
                image["height"] = aa[1];
                j += 7;
                dbTexture["SubTexture"].push(image);
            }
        } catch (e) {

        }
        return JSON.stringify(dbTexture)
    }

    public checkDataValid(spineJson) {
        var data = JSON.parse(spineJson);
        if (data["skeleton"] && data["skeleton"]["spine"]) {
            return true;
        }
        return false;
    }

    public convertToDBData(spineJson) {
        var DBJson = {};
        try {
            var data = JSON.parse(spineJson);
            DBJson["name"] = "dataName";
            DBJson["version"] = "4.5";
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
                    this.boneArmature(armature["bone"], data["bones"]);
                }
                if (data.hasOwnProperty("ik")) {
                    armature["ik"] = [];
                    this.ikArmature(armature["ik"], data["ik"]);
                }
                if (data.hasOwnProperty("slots")) {
                    armature["slot"] = [];
                    this.armatureSlot = [];
                    this.armatureSlot = armature["slot"];
                    this.slotArmature(armature["slot"], data["slots"]);
                }
                if (data.hasOwnProperty("animations")) {
                    armature["animation"] = [];
                    this.animation(armature["animation"], data["animations"], data["bones"]);
                }
                DBJson["armature"].push(armature);
            }
        } catch (e) {

        }
        return JSON.stringify(DBJson)
    }

    private armatureSlot = [];

    private skinss(skin, data) {
        var _skin = {};
        _skin["name"] = "";
        _skin["slot"] = [];
        for (var obj in data) {
            this.slotSkin(_skin["slot"], data[obj])
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
            //新加mesh类型
            if (data[objss]["type"])
                _display["type"] = data[objss]["type"];
            else
                _display["type"] = "image";
            if (data[objss]["uvs"])
                _display["uvs"] = data[objss]["uvs"];
            if (data[objss]["triangles"])
                _display["triangles"] = data[objss]["triangles"];
            if (data[objss]["vertices"]) {
                _display["vertices"] = data[objss]["vertices"];
                for (var j = 1; j < _display["vertices"].length; j++) {
                    _display["vertices"][j] = -_display["vertices"][j];
                    j++;
                }
            }
            if (data[objss]["width"])
                _display["width"] = data[objss]["width"];
            if (data[objss]["height"])
                _display["height"] = data[objss]["height"];
            if (data[objss]["edges"]) {
                for (var numa = 0; numa < data[objss]["edges"].length; numa++) {
                    data[objss]["edges"][numa] = (data[objss]["edges"][numa] / 2);
                }
                _display["edges"] = [];
                var edgesNum = data[objss]["edges"].length;
                if (data[objss]["hull"]) {
                    var ttArray = this.spliceOutlineAndUserEdge(data[objss]["hull"]*2, data[objss]["edges"], data[objss]["uvs"], data[objss]["width"], data[objss]["height"])
                   if(ttArray.length==2){
                       _display["edges"] = ttArray[0];
                       _display["userEdges"] = ttArray[1];
                   }else{
                       for (var num = 0; num < edgesNum; num++) {
                           _display["edges"].push(data[objss]["edges"][num]);
                       }
                   }
                } else {
                    for (var num = 0; num < edgesNum; num++) {
                        _display["edges"].push(data[objss]["edges"][num]);
                    }
                }
            }
            //新加mesh类型
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

    private ikArmature(ik, data) {
        for (var obj in data) {
            var _ik = {};
            if (data[obj].hasOwnProperty("name"))
                _ik["name"] = data[obj]["name"];
            if (data[obj].hasOwnProperty("target"))
                _ik["target"] = data[obj]["target"];
            if (data[obj].hasOwnProperty("bendPositive") && !data[obj]["bendPositive"]) {
                _ik["bendPositive"] = true;
            } else {
                _ik["bendPositive"] = false;
            }
            if (data[obj].hasOwnProperty("mix"))
                _ik["weight"] = data[obj]["mix"];
            if (data[obj].hasOwnProperty("bones")) {
                if (data[obj]["bones"].length > 1) {
                    _ik["bone"] = data[obj]["bones"][1];
                    _ik["chain"] = 1;
                } else {
                    _ik["bone"] = data[obj]["bones"][0];
                    _ik["chain"] = 0;
                }
            }
            ik.push(_ik);
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
    private animation(animation, data, bones) {
        for (var obj in data) {
            var _animation = {};
            _animation["name"] = obj;
            //Spine中的数据还包含 drawOrder ，因DB不支持，故没做解析导入
            var boneTimelines = [];
            if (data[obj].hasOwnProperty("bones")) {
                _animation["bone"] = [];
                for (var objb in data[obj]["bones"]) {
                    var _bone = {};
                    _bone["name"] = objb;
                    this.boneAnimation(_bone, data[obj]["bones"][objb]);
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
            //mesh
            if (data[obj].hasOwnProperty("ffd")) {
                _animation["ffd"] = [];
                for (var objf in data[obj]["ffd"]) {
                    //_ffd.name = objf;
                    this.ffdAnimation(_animation["ffd"], data[obj]["ffd"][objf])
                }
            }
            //mesh
            if (data[obj].hasOwnProperty("slots")) {
                _animation["slot"] = [];
                for (var objs in data[obj]["slots"]) {
                    var _slot = {};
                    _slot["name"] = objs;
                    this.slotAnimation(_slot, data[obj]["slots"][objs]);
                    _animation["slot"].push(_slot);
                }
            }
            if (data[obj].hasOwnProperty("events")) {
                _animation["frame"] = [];
                var isFirstEvent = false;

                for (var evt in data[obj]["events"]) {
                    var events = {};
                    this.eventAnimation(events, data[obj]["events"][evt]);
                    _animation["frame"].push(events);
                    if (data[obj]["events"][evt]["time"] == 0)
                        isFirstEvent = true
                }
                if (!isFirstEvent) {
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

    private boneAnimation(_bone, data) {
        _bone["frame"] = [];
        var _frame = {};
        var hasFirstFrame = false;
        if (data.hasOwnProperty("rotate")) {
            for (var obj in data["rotate"]) {
                _frame = {};
                _bone["frame"].push(_frame);
                if (data["rotate"][obj].hasOwnProperty("time")) {
                    _frame["duration"] = Math.round(Number(data["rotate"][obj]["time"]) * this.SPINE_FRAME);
                }
                if (data["rotate"][obj].hasOwnProperty("angle")) {
                    if (!_frame["transform"])
                        _frame["transform"] = {};
                    _frame["transform"]["skX"] = -data["rotate"][obj]["angle"];
                    _frame["transform"]["skY"] = -data["rotate"][obj]["angle"];
                }
                this.addCurveToDB(_frame, data["rotate"][obj]);
                if (_frame["duration"] == 0) {
                    hasFirstFrame = true;
                }
            }
            if (!hasFirstFrame) {
                hasFirstFrame = true;
                _frame = {};
                _frame["duration"] = 0;
                this.addCurveToDB(_frame, {});
                _bone["frame"].push(_frame);
            }
        }
        var flag = -1;
        if (data.hasOwnProperty("translate")) {
            for (var objl in data["translate"]) {
                if (data["translate"][objl].hasOwnProperty("time"))
                    flag = this.getFrameForTime(_bone, Math.round(Number(data["translate"][objl]["time"]) * this.SPINE_FRAME));
                if (flag < 0) {
                    _frame = {};
                    _bone["frame"].push(_frame);
                    if (data["translate"][objl].hasOwnProperty("time")) {
                        _frame["duration"] = Math.round(Number(data["translate"][objl]["time"]) * this.SPINE_FRAME);
                    }
                } else {
                    _frame = _bone["frame"][flag];
                }
                if (data["translate"][objl].hasOwnProperty("x")) {
                    if (!_frame["transform"])
                        _frame["transform"] = {};
                    _frame["transform"]["x"] = data["translate"][objl]["x"];
                }
                if (data["translate"][objl].hasOwnProperty("y")) {
                    if (!_frame["transform"])
                        _frame["transform"] = {};
                    _frame["transform"]["y"] = -data["translate"][objl]["y"];
                }
                this.addCurveToDB(_frame, data["translate"][objl]);
                if (_frame["duration"] == 0) {
                    hasFirstFrame = true;
                }
            }
            if (!hasFirstFrame) {
                hasFirstFrame = true;
                _frame = {};
                _frame["duration"] = 0;
                this.addCurveToDB(_frame, {});
                _bone["frame"].push(_frame);
            }
        }
        flag = -1
        if (data.hasOwnProperty("scale")) {
            for (var objy in data["scale"]) {
                if (data["scale"][objy].hasOwnProperty("time"))
                    flag = this.getFrameForTime(_bone, Math.round(Number(data["scale"][objy]["time"]) * this.SPINE_FRAME));
                if (flag < 0) {
                    _frame = {};
                    _bone["frame"].push(_frame);
                    if (data["scale"][objy].hasOwnProperty("time")) {
                        _frame["duration"] = Math.round(Number(data["scale"][objy]["time"]) * this.SPINE_FRAME);
                    }
                } else {
                    _frame = _bone["frame"][flag];
                }
                if (data["scale"][objy].hasOwnProperty("x")) {
                    if (!_frame["transform"])
                        _frame["transform"] = {};
                    _frame["transform"]["scX"] = data["scale"][objy]["x"];
                }
                if (data["scale"][objy].hasOwnProperty("y")) {
                    if (!_frame["transform"])
                        _frame["transform"] = {};
                    _frame["transform"]["scY"] = data["scale"][objy]["y"];
                }
                this.addCurveToDB(_frame, data["scale"][objy]);
                if (_frame["duration"] == 0) {
                    hasFirstFrame = true;
                }
            }
            if (!hasFirstFrame) {
                hasFirstFrame = true;
                _frame = {};
                _frame["duration"] = 0;
                this.addCurveToDB(_frame, {});
                _bone["frame"].push(_frame);
            }
        }
        _bone["frame"].sort(this.Compare);
        this.repairDuration(_bone["frame"]);
    }

    private ffdAnimation(ffd, data) {
        for (var fd in data) {
            var _ffd = {};
            _ffd["slot"] = fd;
            _ffd["skin"] = "";
            _ffd["scale"] = 1;
            _ffd["offset"] = 0;
            _ffd["frame"] = [];
            for (var fdname in data[fd]) {
                _ffd["name"] = fdname;
                this.fddFrameAnimation(_ffd["frame"], data[fd][fdname])
            }
            _ffd["frame"].sort(this.Compare);
            this.repairDuration(_ffd["frame"]);
            ffd.push(_ffd)
        }
    }

    private fddFrameAnimation(fddFrame, data) {
        var hasFirstFrame = false;
        for (var k = 0, len = data.length; k < len; k++) {
            var ffdFrame = {};
            var temp = 0;
            if (data[k].hasOwnProperty("time")) {
                ffdFrame["duration"] = Math.round(Number(data[k]["time"]) * this.SPINE_FRAME);
            }
            if (data[k].hasOwnProperty("offset")) {
                ffdFrame["offset"] = data[k]["offset"];
                temp = ffdFrame["offset"];
            }
            if (data[k].hasOwnProperty("vertices")) {
                ffdFrame["vertices"] = [];
                ffdFrame["vertices"] = data[k]["vertices"];
                for (var i = 0; i < ffdFrame["vertices"].length; i++) {
                    if (temp % 2 == 1) {
                        ffdFrame["vertices"][i] = -ffdFrame["vertices"][i];
                        i++;
                    } else {
                        i++;
                        ffdFrame["vertices"][i] = -ffdFrame["vertices"][i];
                    }
                }
            }
            this.addCurveToDB(ffdFrame, data[k])
            if (ffdFrame["duration"] == 0) {
                hasFirstFrame = true;
            }
            fddFrame.push(ffdFrame);
        }
        if (!hasFirstFrame) {//如果没有第一帧，添加第一帧
            hasFirstFrame = true;
            var _frame = {};
            _frame["duration"] = 0;
            fddFrame.push(_frame);
        }
    }

    private slotAnimation(_slot, data) {
        var _frame = {}
        var hasFirstFrame = false;
        if (data.hasOwnProperty("attachment")) {
            _slot["frame"] = [];
            for (var obj in data["attachment"]) {
                _frame = {};
                if (data["attachment"][obj].hasOwnProperty("time")) {
                    _frame["duration"] = Math.round(Number(data["attachment"][obj]["time"]) * this.SPINE_FRAME);
                }

                if (data["attachment"][obj].hasOwnProperty("name")) {//如果有这个参数，设置为对应的图片或者不显示，如果没有，去slotArmatureSlot找默认值
                    if (data["attachment"][obj]["name"])//如果有参数，不是正常图片，就是null，如果为null，则不显示
                        _frame["displayIndex"] = this.displayIndexObject[data["attachment"][obj]["name"]];
                    else
                        _frame["displayIndex"] = -1;
                }
                this.addCurveToDB(_frame, data["attachment"][obj]);
                _slot["frame"].push(_frame);
                if (_frame["duration"] == 0) {
                    hasFirstFrame = true;
                }
            }
            var flagC = -1
            if (!hasFirstFrame) {//如果没有第一帧，添加第一帧
                hasFirstFrame = true;
                flagC = this.getFrameForTime(_slot, 0);
                if (flagC < 0) {
                    _frame = {};
                    _slot["frame"].push(_frame);
                    _frame["duration"] = 0;
                    this.addCurveToDB(_frame, {});
                } else {
                    _frame = _slot["frame"][flagC];
                }
                //检测slot中slot.name的displayIndex
                for (var oo = 0; oo < this.armatureSlot.length; oo++) {
                    if (this.armatureSlot[oo]["name"] == _slot["name"]) {
                        if (this.armatureSlot[oo].hasOwnProperty("displayIndex"))
                            _frame["displayIndex"] = this.armatureSlot[oo]["displayIndex"];//如果运动中spine的第一帧取slotArnature默认值。
                    }
                }
            }
        }

        var flag = -1;
        if (data.hasOwnProperty("color")) {
            if (!_slot["frame"])
                _slot["frame"] = [];
            for (var objs in data["color"]) {
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
                    for (var k = 0; k < _slot["frame"].length; k++) {
                        if (_frame["duration"] > _slot["frame"][k]["duration"]) {
                            perFrame = _slot["frame"][k];
                        }
                    }
                    //设置此帧的displayIndex
                    if (perFrame["duration"] == 0) {
                        for (var kk = 0; kk < this.armatureSlot.length; kk++) {
                            if (this.armatureSlot[kk]["name"] == _slot["name"]) {
                                if (this.armatureSlot[kk].hasOwnProperty("displayIndex"))
                                    perFrame["displayIndex"] = this.armatureSlot[kk]["displayIndex"];//如果运动中spine的第一帧取slotArnature默认值。
                            }
                        }
                    }
                    if (perFrame.hasOwnProperty("displayIndex"))
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
            if (!hasFirstFrame) {//如果没有第一帧，添加第一帧
                hasFirstFrame = true;
                flagCD = this.getFrameForTime(_slot, 0);
                if (flagCD < 0) {
                    _frame = {};
                    _slot["frame"].push(_frame);
                    _frame["duration"] = 0;
                    this.addCurveToDB(_frame, {});
                } else {
                    _frame = _slot["frame"][flagCD];
                }
                //检测slot中slot.name的displayIndex
                for (var ood = 0; ood < this.armatureSlot.length; ood++) {
                    if (this.armatureSlot[ood]["name"] == _slot["name"]) {
                        if (this.armatureSlot[ood].hasOwnProperty("displayIndex"))
                            _frame["displayIndex"] = this.armatureSlot[ood]["displayIndex"];//如果运动中spine的第一帧取slotArnature默认值。
                    }
                }
            }
        }
        _slot["frame"].sort(this.Compare);
        this.repairDuration(_slot["frame"]);
    }

    private eventAnimation(_event, data) {
        if (data.hasOwnProperty("name"))
            _event["event"] = data["name"];
        if (data.hasOwnProperty("time")) {
            _event["duration"] = Math.round(Number(data["time"]) * this.SPINE_FRAME);
        }

    }


    private changeColorToDB(colorString) {
        var _color = {};
        var arr = [];
        for (var i = 0; i < colorString.length; i++) {
            if (i % 2 == 0)
                arr.push(parseInt(colorString.substr(i, 2), 16));
        }
        _color["rM"] = (arr[0] / 255) * 100;
        _color["gM"] = (arr[1] / 255) * 100;
        _color["bM"] = (arr[2] / 255) * 100;
        _color["aM"] = (arr[3] / 255) * 100;
        return _color;
    }


    /**将从小到大的递增数设置为逐级差值**/
    private repairDuration(frame) {
        for (var i = 0; i < frame.length - 1; i++) {
            frame[i]["duration"] = frame[i + 1]["duration"] - frame[i]["duration"];
        }
        frame[frame.length - 1]["duration"] = 0;
    }

    /**排序，按时间顺序**/
    private Compare(paraA, paraB) {
        var durationA = paraA["duration"];
        var durationB = paraB["duration"];
        if (durationA > durationB) {
            return 1;
        }
        else if (durationA < durationB) {
            return -1;
        }
        else {
            return 0;
        }
    }

    /**获取同时间点的Frame**/
    private getFrameForTime(_bone, times) {
        var flag = -1;
        for (var i = 0; i < _bone["frame"].length; i++) {
            if (_bone["frame"][i]["duration"] == times)
                flag = i;
        }
        return flag;
    }

    private addCurveToDB(_frame, obj) {
        if (obj.hasOwnProperty("curve")) {
            if (obj["curve"] == "stepped") {
                if (!_frame["tweenEasing"]) {
                    _frame["tweenEasing"] = "NaN";
                }
            } else {
                this.addCurveToFrame(_frame, obj["curve"]);
            }
        } else {
            //spine没有值，就是直线
            this.addCurveToFrame(_frame, [0, 0, 1, 1]);
            if (!_frame["tweenEasing"]) {
                _frame["tweenEasing"] = 0;
            }
        }
    }

    private addCurveToFrame(_frame, _curve) {
        if (_frame["curve"]) {
            _frame["curve"] = this.getTwoCurveAverage(_frame["curve"], _curve);
        } else {
            _frame["curve"] = _curve;
        }
    }

    private getTwoCurveAverage(curve1, curve2) {
        var _curve = [];
        for (var i = 0; i < 4; i++) {
            _curve[i] = (curve1[i] + curve2[i]) / 2
        }
        return _curve;
    }

    /**
     * 分开边线和内部线
     * @param    points
     * @param    hull
     * @param    edges
     * @return
     */
    public spliceOutlineAndUserEdge(hull, edges, uv, width, height) {
        var leftIndex = -1;
        var rightIndex = -1;
        var topIndex = -1;
        var bottomIndex = -1;
        var i;
        var len;
        var leftMax = Number.MAX_VALUE;
        var rightMax = -Number.MAX_VALUE;
        var topMax = -Number.MAX_VALUE;
        var bottomMax = Number.MAX_VALUE;
        var allCircle = [];
        var outlinea = [];
        var points = [];
        var halfW = width / 2;
        var halfH = height / 2;
        var returnArr=[];

        for (i = 0, len = uv.length; i < len; i += 2) {
            points.push(width * uv[i] - halfW);
            points.push(height * uv[i + 1] - halfH);
        }

        //找到上下左右四个点的位置，这四个点肯定是边界上的点
        for (i = 0, len = points.length; i < len; i += 2) {
            if (points[i] < leftMax) {
                leftIndex = i / 2;
                leftMax = points[i];
            }
            if (points[i] > rightMax) {
                rightIndex = i / 2;
                rightMax = points[i];
            }
            if (points[i + 1] > topMax) {
                topIndex = i / 2;
                topMax = points[i + 1];
            }
            if (points[i + 1] < bottomMax) {
                bottomIndex = i / 2;
                bottomMax = points[i + 1];
            }
        }
        //找到最左边的点作为起点
        var p0 = leftIndex;
        var p1 = -1;
        for (i = 0, len = edges.length; i < len; i += 2) {
            if (edges[i] == p0) {
                p1 = edges[i + 1];
                break;
            }
            else if (edges[i + 1] == p0) {
                p1 = p0;
                p0 = edges[i];
                break;
            }
        }
        //起点开始找环路
        if (p0 >= 0 && p1 >= 0) {
            //找到所有的环路
            allCircle = this.findAllCircle(p0, p1, edges);

            //找到所有环路的点的数量和边界点的数量相同的环路
            for (i = 0, len = allCircle.length; i < len; i++) {
                if (allCircle[i].length != hull) {
                    allCircle.splice(i, 1);
                    i--;
                    len--;
                }
            }
            //只有一条回路，一定是边界
            if (allCircle.length == 1) {
                //find outline;
                outlinea = allCircle[0];
            }
            else {
                //找到包含上下左右四个点的环路
                for (i = 0, len = allCircle.length; i < len; i++) {
                    if ((allCircle[i].indexOf(rightIndex) == -1) ||
                        (allCircle[i].indexOf(topIndex) == -1) ||
                        (allCircle[i].indexOf(bottomIndex) == -1)) {
                        allCircle.splice(i, 1);
                        i--;
                        len--;
                    }
                }
                if (allCircle.length == 1) {
                    //find outline;
                    outlinea = allCircle[0];
                }
                else {
                    ///*
                    //有多个环路
                    var allCircleVertex = [];
                    var curCircleVertex = [];
                    var tmpCircleVertex = [];

                    for (i = 0, len = allCircle.length; i < len; i++) {
                        curCircleVertex = [];
                        for (var j = 0, jLen = allCircle[i].length; j < jLen; j++) {
                            curCircleVertex.push(new Point(points[allCircle[i][j] * 2], points[allCircle[i][j] * 2 + 1]));
                        }
                        allCircleVertex.push(curCircleVertex);
                    }
                    //找到最外面的环路就是边界
                    for (i = 0, len = allCircleVertex.length; i < len; i++) {
                        curCircleVertex = allCircleVertex[i];
                        var isOutline = true;
                        for (j = 0, jLen = allCircleVertex.length; j < jLen; j++) {
                            if (j != i) {
                                tmpCircleVertex = allCircleVertex[j];
                                if (this.isCirlceBigger(tmpCircleVertex, curCircleVertex, allCircle[j], allCircle[i], points)) {
                                    isOutline = false;
                                    break;
                                }
                            }
                        }
                        if (isOutline) {
                            break;
                        }
                    }
                    //find outline;
                    outlinea = allCircle[i];
                }
            }
            if (outlinea) {
                for (i = 0, len = outlinea.length; i < len; i += 2) {
                    this.removePointFromEdges(edges, outlinea[i], outlinea[i + 1]);
                }
                returnArr[0] = outlinea;
                returnArr[1] = edges;
            }
        }
        return returnArr;
    }

    public findAllCircle(p0, p1, edges) {
        var finishCircle = [];
        var allCircle = [];
        var curCircle = [];
        var curEdges = [];
        var finished = false;
        var tp0;
        var tp1;

        var i = 0;
        var len;

        allCircle[0] = [p0, p1];

        while (!finished) {
            for (i = 0; i < allCircle.length; i++) {
                curCircle = allCircle[i];
                tp0 = curCircle[curCircle.length - 2];
                tp1 = curCircle[curCircle.length - 1];
                curEdges = this.getConnectEdges(tp0, tp1, edges);
                if (curEdges.length == 0) {
                    allCircle.splice(i, 1);
                    i--;
                }
                else {
                    if (curEdges.length > 2) {
                        for (var j = 2; j < curEdges.length; j += 2) {
                            var tempIndex = curCircle.indexOf(curEdges[j + 1]);
                            if (tempIndex % 2 == 1) {
                                continue;
                            }
                            var newCurcle = curCircle.concat();
                            newCurcle.push(curEdges[j]);
                            newCurcle.push(curEdges[j + 1]);
                            if (curEdges[j + 1] == newCurcle[0]) {
                                finishCircle.push(newCurcle);
                            }
                            else {
                                allCircle.push(newCurcle);
                            }
                        }
                    }
                    tempIndex = curCircle.indexOf(curEdges[1]);
                    if (tempIndex % 2 == 1) {
                        allCircle.splice(i, 1);
                        i--;
                    }
                    else {
                        curCircle.push(curEdges[0], curEdges[1]);
                        if (curEdges[1] == curCircle[0]) {
                            finishCircle.push(curCircle);
                            allCircle.splice(i, 1);
                            i--;
                        }
                    }

                }
            }
            finished = allCircle.length == 0;
        }
        return finishCircle;
    }

    private getConnectEdges(p0, p1, edges) {
        var i;
        var len;
        var x;
        var y;
        var connectEdges = [];

        for (i = 0, len = edges.length / 2; i < len; i++) {
            x = edges[i * 2];
            y = edges[i * 2 + 1];
            if ((x == p0 && y == p1) || ( x == p1 && y == p0)) {
                continue;
            }
            if (x == p1) {
                connectEdges.push(x, y);
            }
            else if (y == p1) {
                connectEdges.push(y, x);
            }
        }
        return connectEdges;
    }

    private pointInCircle(vertex, outlines) {
        var x = vertex.x;
        var y = vertex.y;
        var i;
        var j;
        var len;
        var inside = false;
        if (outlines == null) {
            return false;
        }
        for (i = 0, len = outlines.length; i < len; i += 2) {
            var xi = outlines[i].x;
            var yi = outlines[i].y;
            var xj = outlines[i + 1].x;
            var yj = outlines[i + 1].y;

            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) {
                inside = !inside;
            }
        }
        return inside;
    }

    private isCirlceBigger(circle1, circle2, circleIndex1, circleIndex2, points) {
        var i;
        var len;
        var tempP = new Point();
        for (i = 0, len = circleIndex1.length; i < len; i++) {
            if (circleIndex2.indexOf(circleIndex1[i]) == -1) {
                tempP.x = points[circleIndex1[i] * 2];
                tempP.y = points[circleIndex1[i] * 2 + 1];
                if (this.pointInCircle(tempP, circle2)) {
                    return false;
                }
                else {
                    return true;
                }
            }
        }
        return true;
    }

    private getEdgeIndex(edges, p0, p1) {
        var index = -1;
        for (var i = 0, len = edges.length; i < len; i += 2) {
            if ((edges[i] == p0 && edges[i + 1] == p1) || (edges[i] == p1 && edges[i + 1] == p0)) {
                index = i;
                break;
            }
        }
        return index;
    }

    private removePointFromEdges(edges, p0, p1) {
        var index = this.getEdgeIndex(edges, p0, p1);
        if (index >= 0) {
            edges.splice(index, 2);
        }
    }
}