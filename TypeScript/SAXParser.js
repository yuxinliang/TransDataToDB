/**
 * Created by Administrator on 2015/9/10.
 */
/**
 * @deprecated
 * @private
 */
var SAXParser = (function () {
    function SAXParser() {
        this._parser = null;
        this._xmlDict = null;
        this._isSupportDOMParser = null;
        this._xmlDict = {};
        if (window["DOMParser"]) {
            this._isSupportDOMParser = true;
            this._parser = new DOMParser();
        }
        else {
            this._isSupportDOMParser = false;
        }
    }
    /**
     * @deprecated
     */
    SAXParser.getInstance = function () {
        if (!SAXParser._instance) {
            SAXParser._instance = new SAXParser();
        }
        return SAXParser._instance;
    };
    /**
     * @deprecated
     */
    SAXParser.prototype.parserXML = function (textxml) {
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
        }
        else {
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(textxml);
        }
        return xmlDoc;
    };
    SAXParser._instance = null;
    return SAXParser;
})();
