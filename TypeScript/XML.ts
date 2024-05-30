    class XML {

        /**
         * 解析一个XML字符串为JSON对象。
         * @method egret.XML.parse
         * @param value {string} 要解析的XML字符串。
         * @returns {any} 解析完后的JSON对象
         * @platform Web
         */
        public static parse(value:string):any{
            var xmlDoc = new DOMParser().parseFromString(value, "text/xml");//SAXParser.getInstance().parserXML(value);
            if(!xmlDoc||!xmlDoc.childNodes){
                return null;
            }
            var length:number = xmlDoc.childNodes.length;
            var found:boolean = false;
            for(var i:number=0;i<length;i++){
                var node:any = xmlDoc.childNodes[i];
                if(node.nodeType == 1){
                    found = true;
                    break;
                }
            }
            if(!found){
                return null;
            }
            var xml = this.loop(XML.parseNode(node));
            return xml;
        }

        private static loop(_obj:Object):string {
            var xml:string = "";
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
        }
        private static parseNode(node:any):any{
            if(!node||node.nodeType != 1){
                return null;
            }
            var xml:any = {};
            xml.localName = node.localName;
            xml.name = node.nodeName;
            if(node.namespaceURI)
                xml.namespace = node.namespaceURI;
            if(node.prefix)
                xml.prefix = node.prefix;
            var attributes:any = node.attributes;
            var length:number = attributes.length;
            for(var i:number=0;i<length;i++){
                var attrib:any = attributes[i];
                var key:string = attrib.name;
                if (key.indexOf("xmlns:") == 0) {
                    continue;
                }
                xml["$"+key] = attrib.value;
            }
            var children:any = node.childNodes;
            length = children.length;
            for(i=0;i<length;i++){
                var childNode:any = children[i];
                var childXML:any = XML.parseNode(childNode);
                if(childXML){
                    if(!xml.children){
                        xml.children = [];
                    }
                    childXML.parent = xml;
                    xml.children.push(childXML);
                }
            }
            if(!xml.children){
                var text:string = node.textContent.trim();
                if(text){
                    xml.text = text;
                }
            }
            return xml;
        }
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
        public static findChildren(xml:any,path:string,result?:Array<any>):Array<any>{
            if(!result){
                result = [];
            }
            else{
                result.length = 0;
            }
            XML.findByPath(xml,path,result);
            return result;
        }

        /**
         * @private
         * @method egret.XML.findByPath
         * @param xml {any}
         * @param path {string}
         * @param result {egret.Array<any>}
         * @platform Web
         */
        private static findByPath(xml:any,path:string,result:Array<any>):void{
            var index:number = path.indexOf(".");
            var key:string;
            var end:boolean;
            if(index==-1){
                key = path;
                end = true;
            }
            else{
                key = path.substring(0,index);
                path = path.substring(index+1);
                end = false;
            }
            var children:Array<any> = xml.children;
            if(!children){
                return;
            }
            var length:number = children.length;
            for(var i:number=0;i<length;i++){
                var child:any = children[i];
                if(child.localName==key){
                    if(end){
                        result.push(child);
                    }
                    else{
                        XML.findByPath(child,path,result);
                    }
                }
            }
        }
        /**
         * 获取一个XML节点上的所有属性名列表
         * @method egret.XML.getAttributes
         * @param xml {any} 要查找的XML节点。
         * @param result {egret.Array<any>} 可选参数，传入一个数组用于存储查找的结果。这样做能避免重复创建对象。
         * @returns {string} 节点上的所有属性名列表
         * @platform Web
         */
        public static getAttributes(xml:any,result?:Array<any>):Array<string>{
            if(!result){
                result = [];
            }
            else{
                result.length = 0;
            }
            for(var key in xml){
                if(key.charAt(0)=="$"){
                    result.push(key.substring(1));
                }
            }
            return result;
        }
    }
