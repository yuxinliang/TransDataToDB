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
        var xml = this.loop(XML.parseNode(node));
        return xml;
    };
    XML.loop = function (_obj) {
        var xml = "";
        for (var temp in _obj) {
            //生成属性
            if (temp.charAt(0) == "$") {
                xml = xml.concat(temp.substring(1, temp.length) + " = \"" + _obj[temp] + "\" ");
            }
        }
        if (_obj["text"] != undefined) {
            xml = xml.concat(_obj["text"]);
        }
        if (_obj["children"] != undefined) {
            for (var prop in _obj["children"]) {
                xml = xml.concat(":" + this.loop(_obj["children"][prop]));
            }
        }
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
