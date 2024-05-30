/**
 * Created by Administrator on 2015/9/10.
 */

    /**
     * @deprecated
     * @private
     */
    class SAXParser {
        static _instance:SAXParser = null;

        /**
         * @deprecated
         */
        static getInstance() {
            if (!SAXParser._instance) {
                SAXParser._instance = new SAXParser();
            }
            return SAXParser._instance;
        }

        private _parser:any = null;
        private _xmlDict:any = null;
        private _isSupportDOMParser:any = null;

        public constructor() {
            this._xmlDict = {};
            if (window["DOMParser"]) {
                this._isSupportDOMParser = true;
                this._parser = new DOMParser();
            } else {
                this._isSupportDOMParser = false;
            }
        }

        /**
         * @deprecated
         */
        public parserXML(textxml:string):any {
            var i = 0;
            while (textxml.charAt(i) == "\n" || textxml.charAt(i) == "\t" || textxml.charAt(i) == "\r" || textxml.charAt(i) == " ") {
                i++;
            }

            if (i != 0) {
                textxml = textxml.substring(i, textxml.length);
            }

            var xmlDoc;
            if (this._isSupportDOMParser) {
                xmlDoc = this._parser.parseFromString(textxml, "text/xml");
            } else {
                xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = "false";
                xmlDoc.loadXML(textxml);
            }
            return xmlDoc;
        }
    }
