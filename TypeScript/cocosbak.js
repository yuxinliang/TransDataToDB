var rf=require("fs");
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var xmlToJSON = (function () {

    this.version = "1.3";

    var options = { // set up the default options
        mergeCDATA: true, // extract cdata and merge with text
        grokAttr: true, // convert truthy attributes to boolean, etc
        grokText: true, // convert truthy text/attr to boolean, etc
        normalize: true, // collapse multiple spaces to single space
        xmlns: true, // include namespaces as attribute in output
        namespaceKey: '_ns', // tag name for namespace objects
        textKey: '_text', // tag name for text nodes
        valueKey: '_value', // tag name for attribute values
        attrKey: '_attr', // tag for attr groups
        cdataKey: '_cdata', // tag for cdata nodes (ignored if mergeCDATA is true)
        attrsAsObject: true, // if false, key is used as prefix to name, set prefix to '' to merge children and attrs.
        stripAttrPrefix: true, // remove namespace prefixes from attributes
        stripElemPrefix: true, // for elements of same name in diff namespaces, you can enable namespaces and access the nskey property
        childrenAsArray: true // force children into arrays
    };

    var prefixMatch = new RegExp(/(?!xmlns)^.*:/);
    var trimMatch = new RegExp(/^\s+|\s+$/g);

    this.grokType = function (sValue) {
        if (/^\s*$/.test(sValue)) {
            return null;
        }
        if (/^(?:true|false)$/i.test(sValue)) {
            return sValue.toLowerCase() === "true";
        }
        if (isFinite(sValue)) {
            return parseFloat(sValue);
        }
        return sValue;
    };

    this.parseString = function (xmlString, opt) {
        return this.parseXML(this.stringToXML(xmlString), opt);
    }

    this.parseXML = function (oXMLParent, opt) {

        // initialize options
        for (var key in opt) {
            options[key] = opt[key];
        }

        var vResult = {},
            nLength = 0,
            sCollectedTxt = "";

        // parse namespace information
        if (options.xmlns && oXMLParent.namespaceURI) {
            vResult[options.namespaceKey] = oXMLParent.namespaceURI;
        }

        // parse attributes
        // using attributes property instead of hasAttributes method to support older browsers
        if (oXMLParent.attributes && oXMLParent.attributes.length > 0) {
            var vAttribs = {};

            for (nLength; nLength < oXMLParent.attributes.length; nLength++) {
                var oAttrib = oXMLParent.attributes.item(nLength);
                vContent = {};
                var attribName = '';

                if (options.stripAttrPrefix) {
                    attribName = oAttrib.name.replace(prefixMatch, '');

                } else {
                    attribName = oAttrib.name;
                }

                if (options.grokAttr) {
                    vContent[options.valueKey] = this.grokType(oAttrib.value.replace(trimMatch, ''));
                } else {
                    vContent[options.valueKey] = oAttrib.value.replace(trimMatch, '');
                }

                if (options.xmlns && oAttrib.namespaceURI) {
                    vContent[options.namespaceKey] = oAttrib.namespaceURI;
                }

                if (options.attrsAsObject) { // attributes with same local name must enable prefixes
                    vAttribs[attribName] = vContent;
                } else {
                    vResult[options.attrKey + attribName] = vContent;
                }
            }

            if (options.attrsAsObject) {
                vResult[options.attrKey] = vAttribs;
            } else {}
        }

        // iterate over the children
        if (oXMLParent.hasChildNodes()) {
            for (var oNode, sProp, vContent, nItem = 0; nItem < oXMLParent.childNodes.length; nItem++) {
                oNode = oXMLParent.childNodes.item(nItem);

                if (oNode.nodeType === 4) {
                    if (options.mergeCDATA) {
                        sCollectedTxt += oNode.nodeValue;
                    } else {
                        if (vResult.hasOwnProperty(options.cdataKey)) {
                            if (vResult[options.cdataKey].constructor !== Array) {
                                vResult[options.cdataKey] = [vResult[options.cdataKey]];
                            }
                            vResult[options.cdataKey].push(oNode.nodeValue);

                        } else {
                            if (options.childrenAsArray) {
                                vResult[options.cdataKey] = [];
                                vResult[options.cdataKey].push(oNode.nodeValue);
                            } else {
                                vResult[options.cdataKey] = oNode.nodeValue;
                            }
                        }
                    }
                } /* nodeType is "CDATASection" (4) */
                else if (oNode.nodeType === 3) {
                    sCollectedTxt += oNode.nodeValue;
                } /* nodeType is "Text" (3) */
                else if (oNode.nodeType === 1) { /* nodeType is "Element" (1) */

                    if (nLength === 0) {
                        vResult = {};
                    }

                    // using nodeName to support browser (IE) implementation with no 'localName' property
                    if (options.stripElemPrefix) {
                        sProp = oNode.nodeName.replace(prefixMatch, '');
                    } else {
                        sProp = oNode.nodeName;
                    }

                    vContent = xmlToJSON.parseXML(oNode);

                    if (vResult.hasOwnProperty(sProp)) {
                        if (vResult[sProp].constructor !== Array) {
                            vResult[sProp] = [vResult[sProp]];
                        }
                        vResult[sProp].push(vContent);

                    } else {
                        if (options.childrenAsArray) {
                            vResult[sProp] = [];
                            vResult[sProp].push(vContent);
                        } else {
                            vResult[sProp] = vContent;
                        }
                        nLength++;
                    }
                }
            }
        } else if (!sCollectedTxt) { // no children and no text, return null
            if (options.childrenAsArray) {
                vResult[options.textKey] = [];
                vResult[options.textKey].push(null);
            } else {
                vResult[options.textKey] = null;
            }
        }

        if (sCollectedTxt) {
            if (options.grokText) {
                var value = this.grokType(sCollectedTxt.replace(trimMatch, ''));
                if (value !== null && value !== undefined) {
                    vResult[options.textKey] = value;
                }
            } else if (options.normalize) {
                vResult[options.textKey] = sCollectedTxt.replace(trimMatch, '').replace(/\s+/g, " ");
            } else {
                vResult[options.textKey] = sCollectedTxt.replace(trimMatch, '');
            }
        }

        return vResult;
    }


    // Convert xmlDocument to a string
    // Returns null on failure
    this.xmlToString = function (xmlDoc) {
        try {
            var xmlString = xmlDoc.xml ? xmlDoc.xml : (new XMLSerializer()).serializeToString(xmlDoc);
            return xmlString;
        } catch (err) {
            return null;
        }
    }

    // Convert a string to XML Node Structure
    // Returns null on failure
    this.stringToXML = function (xmlString) {
        try {
            var xmlDoc = null;

            if (window.DOMParser) {

                var parser = new DOMParser();
                xmlDoc = parser.parseFromString(xmlString, "text/xml");

                return xmlDoc;
            } else {
                xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = false;
                xmlDoc.loadXML(xmlString);

                return xmlDoc;
            }
        } catch (e) {
            return null;
        }
    }

    return this;
})();

if (typeof module != "undefined" && module !== null && module.exports) module.exports = xmlToJSON;
else if (typeof define === "function" && define.amd) define(function() {return xmlToJSON});

var p = process.argv[2];

var data=rf.readFileSync(p,"utf-8");

console.log(data);

var XML = (function () {
    function XML() {
    }
    /**
     * 解析一个XML字符串为JSON对象。
     * @method egret.XML.parse
     * @param value {string} 要解析的XML字符串。
     * @returns {any} 解析完后的JSON对象
     * @platform Web
     */
    XML.parse = function (value) {
        var xmlDoc = new DOMParser().parseFromString(value, "text/xml"); //SAXParser.getInstance().parserXML(value);
        if (!xmlDoc || !xmlDoc.childNodes) {
            return null;
        }
        var length = xmlDoc.childNodes.length;
        var found = false;
        for (var i = 0; i < length; i++) {
            var node = xmlDoc.childNodes[i];
            if (node.nodeType == 1) {
                found = true;
                break;
            }
        }
        if (!found) {
            return null;
        }
        var xml = XML.parseNode(node);
        return xml;
    };
    XML.parseNode = function (node) {
        if (!node || node.nodeType != 1) {
            return null;
        }
        var xml = {};
        xml.localName = node.localName;
        xml.name = node.nodeName;
        if (node.namespaceURI)
            xml.namespace = node.namespaceURI;
        if (node.prefix)
            xml.prefix = node.prefix;
        var attributes = node.attributes;
        var length = attributes.length;
        for (var i = 0; i < length; i++) {
            var attrib = attributes[i];
            var key = attrib.name;
            if (key.indexOf("xmlns:") == 0) {
                continue;
            }
            xml["$" + key] = attrib.value;
        }
        var children = node.childNodes;
        length = children.length;
        for (i = 0; i < length; i++) {
            var childNode = children[i];
            var childXML = XML.parseNode(childNode);
            if (childXML) {
                if (!xml.children) {
                    xml.children = [];
                }
                childXML.parent = xml;
                xml.children.push(childXML);
            }
        }
        if (!xml.children) {
            var text = node.textContent.trim();
            if (text) {
                xml.text = text;
            }
        }
        return xml;
    };
    /**
     *
     * 查找xml上符合节点路径的所有子节点。
     * @method egret.XML.findChildren
     * @param xml {any} 要查找的XML节点。
     * @param path {string} 子节点路径，例如"item.node"
     * @param result {egret.Array<any>} 可选参数，传入一个数组用于存储查找的结果。这样做能避免重复创建对象。
     * @returns {any} 节点路径的所有子节点
     * @platform Web
     */
    XML.findChildren = function (xml, path, result) {
        if (!result) {
            result = [];
        }
        else {
            result.length = 0;
        }
        XML.findByPath(xml, path, result);
        return result;
    };
    /**
     * @private
     * @method egret.XML.findByPath
     * @param xml {any}
     * @param path {string}
     * @param result {egret.Array<any>}
     * @platform Web
     */
    XML.findByPath = function (xml, path, result) {
        var index = path.indexOf(".");
        var key;
        var end;
        if (index == -1) {
            key = path;
            end = true;
        }
        else {
            key = path.substring(0, index);
            path = path.substring(index + 1);
            end = false;
        }
        var children = xml.children;
        if (!children) {
            return;
        }
        var length = children.length;
        for (var i = 0; i < length; i++) {
            var child = children[i];
            if (child.localName == key) {
                if (end) {
                    result.push(child);
                }
                else {
                    XML.findByPath(child, path, result);
                }
            }
        }
    };
    /**
     * 获取一个XML节点上的所有属性名列表
     * @method egret.XML.getAttributes
     * @param xml {any} 要查找的XML节点。
     * @param result {egret.Array<any>} 可选参数，传入一个数组用于存储查找的结果。这样做能避免重复创建对象。
     * @returns {string} 节点上的所有属性名列表
     * @platform Web
     */
    XML.getAttributes = function (xml, result) {
        if (!result) {
            result = [];
        }
        else {
            result.length = 0;
        }
        for (var key in xml) {
            if (key.charAt(0) == "$") {
                result.push(key.substring(1));
            }
        }
        return result;
    };
    return XML;
})();

/**
 * Created by Yuxin on 2015/9/6.
 */
var cocos = (function () {
    //__extends(cocos, _super);
    function cocos() {
        //_super.apply(this, arguments);
        this.bones = {};
        this.resultArr = [];
        this.layersInfo = {};
        this.dbTexture = {};
        this.timelines = {};
        this.defaultProperty = {
            "x": 0,
            "y": 0,
            "scX": 1,
            "scY": 1,
            "skX": 0,
            "skY": 0,
            "pX": 0,
            "pY": 0,
            "z": 0,
            "scale": 0,
            "offset": 0,
            "loop": 1,
            "fadeInTime": 0,
            "aO": 0,
            "rO": 0,
            "gO": 0,
            "bO": 0,
            "aM": 100,
            "rM": 100,
            "gM": 100,
            "bM": 100,
            "textureScale": 1
        };
    }
    cocos.prototype.dataFileExtension = function () {
        return ["ExportJson"];
    };
    cocos.prototype.dataFileDescription = function () {
        return "Cocos数据";
    };
    cocos.prototype.textureAtlasDataFileExtension = function () {
        return ["plist"];
    };
    cocos.prototype.isSupportTextureAtlas = function () {
        return true;
    };
    cocos.prototype.loop = function (_obj) {
        var xml = "";
        xml = "<" + _obj["name"] + " ";
        for (var temp in _obj) {
            //生成属性
            if (temp.charAt(0) == "$") {
                xml = xml.concat(temp.substring(1, temp.length) + " = \"" + _obj[temp] + "\" ");
            }
        }
        xml = xml.concat(">");
        if (_obj["text"] != undefined) {
            xml = xml.concat(_obj["text"]);
        }
        if (_obj["children"] != undefined) {
            for (var prop in _obj["children"]) {
                xml = xml.concat(this.loop(_obj["children"][prop]));
            }
        }
        xml = xml.concat("</" + _obj["name"] + ">");
        return xml;
    };
    cocos.prototype.convertToDBTextureAtlasData = function (data) {
        var dbTexture = XML.parse(data);
        //var sss = "";
        //for(var ke in dbTexture){
        //    sss +="---" + dbTexture[ke];
        //}
        return this.loop(dbTexture);
        return JSON.stringify(dbTexture);
        var arr = data.split(" ");
        var metadataKey = 0;
        var bb = "";
        for (var i = 0; i < arr.length; i++) {
            bb += arr[i];
            if (arr[i] == "metadata") {
                metadataKey = i;
            }
        }
        var dom = new DOMParser();
        var ddd = dom.parseFromString(data, "text/xml");
        return ddd.documentElement + "------" + ddd.firstChild.toString();
        dbTexture["SubTexture"] = [];
        var imageArr = arr.slice(1, metadataKey);
        for (var j = 0; j < imageArr.length;) {
            var image = {};
            image["name"] = imageArr[j];
            image["x"] = imageArr[j + 10];
            image["y"] = imageArr[j + 12];
            image["width"] = imageArr[j + 2];
            image["height"] = imageArr[j + 4];
            j += 17;
            dbTexture["SubTexture"].push(image);
        }
        var metadataArr = arr.slice(metadataKey);
        dbTexture["imagePath"] = metadataArr[4];
        return JSON.stringify(dbTexture);
    };
    cocos.prototype.checkDataValid = function (stuData) {
        var data = JSON.parse(stuData);
        if (data["content_scale"] && data["texture_data"] && data["animation_data"] && data["armature_data"]) {
            return true;
        }
        else {
            return false;
        }
    };
    cocos.prototype.convertToDBData = function (stuData) {
        this.bones = {};
        this.resultArr = [];
        this.layersInfo = {};
        this.dbTexture = {};
        this.timelines = {};
        var data = JSON.parse(stuData);
        var dbData = { "isGlobal": 0, "isRelativePivot": 1, "armature": [], "version": 2.3, "name": "dataName", "frameRate": 60 };
        dbData["textureScale"] = data["content_scale"] != null ? data["content_scale"] : 2;
        this.parseTexture(data["texture_data"]);
        //for (var key in stuData["texture_data"]) {
        //    this.dbTexture[stuData["texture_data"][key]["name"]] = stuData["texture_data"][key];
        //}
        //for(var l = 0;l<stuData["texture_data"].length;l++){
        //    if(stuData["texture_data"][l]["name"]) {
        //        this.dbTexture[stuData["texture_data"][l]["name"]] = stuData["texture_data"][l];
        //    }
        //}
        //for (var i = 0; i < data["animation_data"].length; i++) {
        var stuAnimation = data["animation_data"][0];
        var stuArmature = data["armature_data"][0];
        var dbArmature = { "bone": [], "skin": [], "animation": [], "name": "armatureName" };
        dbData["armature"].push(dbArmature);
        //设置bone
        this.setBone(dbArmature["bone"], stuArmature["bone_data"], dbData);
        //设置skin
        var skin = { "name": 0, "slot": [] };
        dbArmature["skin"].push(skin);
        this.setSlot(skin["slot"], stuArmature["bone_data"], dbData);
        //设置动画
        this.setAnimation(dbArmature["animation"], stuAnimation["mov_data"], dbData);
        // }
        this.removeDefault(dbArmature);
        return JSON.stringify(dbData);
    };
    cocos.prototype.parseTexture = function (ccTexture) {
        for (var key in ccTexture) {
            this.dbTexture[ccTexture[key]["name"]] = ccTexture[key];
        }
    };
    cocos.prototype.removeDefault = function (obj, parent, parentKey) {
        for (var key in obj) {
            if (obj[key] instanceof Array) {
                if (obj[key].length > 0) {
                    this.removeDefault(obj[key]);
                }
            }
            else if (obj[key] instanceof Object) {
                this.removeDefault(obj[key], obj, key);
            }
            else {
                if (typeof (obj[key]) == "number") {
                    obj[key] = Number(obj[key].toFixed(4));
                }
                if (this.defaultProperty[key] != null && obj[key] == this.defaultProperty[key]) {
                    delete obj[key];
                }
            }
        }
        if (obj instanceof Object) {
            var hasKey = false;
            for (var key in obj) {
                hasKey = true;
                break;
            }
            if (!hasKey && parent && parent[parentKey]) {
                delete parent[parentKey];
            }
        }
    };
    cocos.prototype.setFrame = function (dbFrames, stuFrames, bone, z, dbData) {
        for (var i = 0; i < stuFrames.length; i++) {
            var stuFrame = stuFrames[i];
            var dbFrame = {};
            if (i == 0) {
                var startIdx = stuFrame["fi"];
                if (startIdx != 0) {
                    var temp = { "duration": startIdx, "displayIndex": -1 };
                    dbFrames.push(temp);
                }
            }
            if (stuFrame["dI"] < 0) {
                dbFrame["hide"] = 1;
            }
            else if (stuFrame["dI"] > 0) {
                dbFrame["displayIndex"] = stuFrame["dI"];
            }
            //        else if (stuFrame["dI"] < -900) {
            //            dbFrame["hide"] = 1;
            //        }
            if (stuFrame["tweenFrame"] == false) {
                dbFrame["tweenEasing"] = "NaN";
            }
            dbFrames.push(dbFrame);
            if (i < stuFrames.length - 1) {
                var nextFrame = stuFrames[i + 1];
                dbFrame["duration"] = nextFrame["fi"] - stuFrame["fi"];
            }
            else {
                dbFrame["duration"] = 0;
            }
            if (stuFrame["evt"]) {
                dbFrame["event"] = stuFrame["evt"];
            }
            dbFrame["z"] = z;
            if (stuFrame["bd_src"] == 700 && stuFrame["bd_dst"] == 1) {
                dbFrame["blendMode"] = "add";
            }
            if (stuFrame["color"]) {
                dbFrame["colorTransform"] = {};
                dbFrame["colorTransform"]["aO"] = 0;
                dbFrame["colorTransform"]["rO"] = 0;
                dbFrame["colorTransform"]["gO"] = 0;
                dbFrame["colorTransform"]["bO"] = 0;
                dbFrame["colorTransform"]["aM"] = 100 * stuFrame["color"]["a"] / 255;
                dbFrame["colorTransform"]["rM"] = 100 * stuFrame["color"]["r"] / 255;
                dbFrame["colorTransform"]["gM"] = 100 * stuFrame["color"]["g"] / 255;
                dbFrame["colorTransform"]["bM"] = 100 * stuFrame["color"]["b"] / 255;
            }
            dbFrame["transform"] = {};
            dbFrame["transform"]["x"] = stuFrame["x"] * dbData["textureScale"];
            dbFrame["transform"]["y"] = -stuFrame["y"] * dbData["textureScale"];
            dbFrame["transform"]["scX"] = (stuFrame["cX"] + bone["transform"]["scX"] - 1) / bone["transform"]["scX"];
            dbFrame["transform"]["scY"] = (stuFrame["cY"] + bone["transform"]["scY"] - 1) / bone["transform"]["scY"];
            dbFrame["transform"]["skX"] = this.radianToAngle(stuFrame["kX"]);
            dbFrame["transform"]["skY"] = -this.radianToAngle(stuFrame["kY"]);
        }
    };
    cocos.prototype.clone = function (frame, result) {
        for (var key in frame) {
            if (frame[key] instanceof Array) {
                result[key] = this.clone(frame[key], []);
            }
            else if (frame[key] instanceof Object) {
                result[key] = this.clone(frame[key], {});
            }
            else {
                result[key] = frame[key];
            }
        }
        return result;
    };
    cocos.prototype.setTimeline = function (dbTimelines, stuTimelines, dbData) {
        var tempDbTimelines = {};
        this.timelines = {};
        var maxIdx = 0;
        for (var i = 0; i < stuTimelines.length; i++) {
            var stuTimeline = stuTimelines[i];
            var dbTimeline = {};
            dbTimeline["name"] = stuTimeline["name"];
            this.addToArrayObj(tempDbTimelines, this.bones[stuTimeline["name"]]["z"], dbTimeline);
            dbTimeline["offset"] = 0;
            dbTimeline["frame"] = [];
            this.timelines[dbTimeline["name"]] = dbTimeline;
            dbTimeline["pX"] = 0;
            dbTimeline["pY"] = 0;
            this.setFrame(dbTimeline["frame"], stuTimeline["frame_data"], this.bones[dbTimeline["name"]], i, dbData);
        }
        this.sortArrayObj(tempDbTimelines, dbTimelines);
        //设置层级
        for (var i = 0; i < dbTimelines.length; i++) {
            var frames = dbTimelines[i]["frame"];
            for (var k = 0; k < frames.length; k++) {
                frames[k]["z"] = i;
            }
        }
    };
    cocos.prototype.setAnimation = function (dbAnimations, stuAnimations, dbData) {
        for (var i = 0; i < stuAnimations.length; i++) {
            var stuAnimation = stuAnimations[i];
            var dbAnimation = {};
            dbAnimations.push(dbAnimation);
            dbAnimation["duration"] = stuAnimation["dr"];
            dbAnimation["name"] = stuAnimation["name"];
            dbAnimation["fadeInTime"] = 0;
            dbAnimation["tweenEasing"] = stuAnimation["twE"];
            dbAnimation["loop"] = stuAnimation["lp"] == true ? 0 : 1;
            dbAnimation["scale"] = 1.0 / stuAnimation["sc"];
            dbAnimation["timeline"] = [];
            this.setTimeline(dbAnimation["timeline"], stuAnimation["mov_bone_data"], dbData);
        }
    };
    cocos.prototype.setDisplay = function (dbDisplays, stuDisplays, dbData) {
        for (var i = 0; stuDisplays && i < stuDisplays.length; i++) {
            var stuDisplay = stuDisplays[i];
            var dbDisplay = { "transform": {} };
            dbDisplays.push(dbDisplay);
            if (stuDisplay["displayType"] == 2) {
                dbDisplay["name"] = "noImage";
                dbDisplay["type"] = "image";
            }
            else {
                dbDisplay["name"] = stuDisplay["name"].replace(/(\.png)|(\.jpg)/, "");
                dbDisplay["type"] = "image"; // stuDisplay["displayType"] == 0 ? "image" :
                dbDisplay["transform"]["x"] = stuDisplay["skin_data"][0]["x"] * dbData["textureScale"];
                dbDisplay["transform"]["y"] = -stuDisplay["skin_data"][0]["y"] * dbData["textureScale"];
                dbDisplay["transform"]["pX"] = this.dbTexture[dbDisplay["name"]] ? this.dbTexture[dbDisplay["name"]]["pX"] : 0.5;
                dbDisplay["transform"]["pY"] = this.dbTexture[dbDisplay["name"]] ? (1 - this.dbTexture[dbDisplay["name"]]["pY"]) : 0.5;
                dbDisplay["transform"]["skX"] = this.radianToAngle(stuDisplay["skin_data"][0]["kX"]);
                dbDisplay["transform"]["skY"] = -this.radianToAngle(stuDisplay["skin_data"][0]["kY"]);
                dbDisplay["transform"]["scX"] = stuDisplay["skin_data"][0]["cX"];
                dbDisplay["transform"]["scY"] = stuDisplay["skin_data"][0]["cY"];
            }
        }
    };
    cocos.prototype.setSlot = function (dbSlots, stuSlots, dbData) {
        var tempDbSlots = {};
        for (var i = 0; i < stuSlots.length; i++) {
            var stuSlot = stuSlots[i];
            var dbSlot = {};
            this.addToArrayObj(tempDbSlots, this.bones[stuSlot["name"]]["z"], dbSlot);
            dbSlot["blendMode"] = "normal";
            dbSlot["z"] = this.bones[stuSlot["name"]]["z"];
            dbSlot["name"] = stuSlot["name"];
            dbSlot["parent"] = stuSlot["name"];
            dbSlot["display"] = [];
            this.setDisplay(dbSlot["display"], stuSlot["display_data"], dbData);
        }
        this.sortArrayObj(tempDbSlots, dbSlots);
        for (var i = 0; i < dbSlots.length; i++) {
            dbSlots[i]["z"] = i;
        }
    };
    cocos.prototype.setBone = function (dbBones, stuBones, dbData) {
        var tempDbBones = {};
        for (var i = 0; i < stuBones.length; i++) {
            var stuBone = stuBones[i];
            var dbBone = { "transform": {} };
            this.addToArrayObj(tempDbBones, stuBone["z"], dbBone);
            dbBone["name"] = stuBone["name"];
            dbBone["length"] = stuBone["bl"];
            if (stuBone["parent"] != null && stuBone["parent"] != "") {
                dbBone["parent"] = stuBone["parent"];
            }
            this.setLayer(stuBone["name"], stuBone["parent"]);
            dbBone["transform"]["x"] = stuBone["x"] * dbData["textureScale"];
            dbBone["transform"]["y"] = -stuBone["y"] * dbData["textureScale"];
            dbBone["transform"]["skX"] = this.radianToAngle(stuBone["kX"]);
            dbBone["transform"]["skY"] = -this.radianToAngle(stuBone["kY"]);
            dbBone["transform"]["scX"] = stuBone["cX"];
            dbBone["transform"]["scY"] = stuBone["cY"];
            this.bones[stuBone["name"]] = dbBone;
        }
        this.sortArrayObj(tempDbBones, dbBones);
        for (var i = 0; i < dbBones.length; i++) {
            //todo
            dbBones[i]["z"] = i;
        }
        this.resortLayers();
    };
    cocos.prototype.sortArrayObj = function (arrayObj, resultArray) {
        var maxIdx = 0;
        for (var key in arrayObj) {
            maxIdx = Math.max(key, maxIdx);
        }
        for (var i = 0; i <= maxIdx; i++) {
            if (arrayObj[i] == null) {
                continue;
            }
            for (var j = 0; j < arrayObj[i].length; j++) {
                resultArray.push(arrayObj[i][j]);
            }
        }
    };
    cocos.prototype.addToArrayObj = function (arrayObj, index, obj) {
        if (arrayObj[index] == null) {
            arrayObj[index] = [];
        }
        arrayObj[index].push(obj);
    };
    cocos.prototype.radianToAngle = function (radian) {
        return radian * 180 / Math.PI;
    };
    cocos.prototype.resortLayers = function () {
        var tempArr = [];
        for (var name in this.layersInfo) {
            tempArr.push({ "name": name, "children": this.layersInfo[name].concat([]) });
        }
        while (tempArr.length > 0) {
            for (var i = tempArr.length - 1; i >= 0; i--) {
                var info = tempArr[i];
                if (info["children"].length == 0) {
                    this.resultArr.push(info["name"]);
                    tempArr.splice(i, 1);
                    for (var j = 0; j < tempArr.length; j++) {
                        var temp = tempArr[j];
                        if (temp["children"].indexOf(info["name"]) >= 0) {
                            var idx = temp["children"].indexOf(info["name"]);
                            temp["children"].splice(idx, 1);
                        }
                    }
                }
            }
        }
        this.resultArr.reverse();
    };
    cocos.prototype.setLayer = function (name, parent) {
        if (this.layersInfo[name] == null) {
            this.layersInfo[name] = [];
        }
        if (parent != null && parent != "") {
            if (this.layersInfo[parent] == null) {
                this.layersInfo[parent] = [];
            }
            this.layersInfo[parent].push(name);
        }
    };
    return cocos;
})();


var c = new cocos();
var o = c.convertToDBTextureAtlasData(data);

console.log(o);

