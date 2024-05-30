/**
 * Created by Administrator on 2015/9/10.
 */
class xmlToJSON
{

    private options = {mergeCDATA: true,grokAttr: true, grokText: true, normalize: true,xmlns: true, namespaceKey: '_ns', textKey: '_text', valueKey: '_value', attrKey: '_attr', cdataKey: '_cdata', attrsAsObject: true, stripAttrPrefix:true, stripElemPrefix: true, childrenAsArray: true};

    public prefixMatch = new RegExp("/(?!xmlns)^.*:/");
    public trimMatch = new RegExp("/^\s+|\s+$/g");
    public grokType(sValue){
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
    }
    public parseString(xmlString, opt){
        return this.parseXML(this.stringToXML(xmlString), opt);
    }
    public parseXML(oXMLParent, opt){
// initialize options
        for (var key in opt) {
            this.options[key] = opt[key];
        }

        var vResult = {},
            nLength = 0,
            sCollectedTxt = "";

        // parse namespace information
        if (this.options.xmlns && oXMLParent.namespaceURI) {
            vResult[this.options.namespaceKey] = oXMLParent.namespaceURI;
        }

        // parse attributes
        // using attributes property instead of hasAttributes method to support older browsers
        if (oXMLParent.attributes && oXMLParent.attributes.length > 0) {
            var vAttribs = {};

            for (nLength; nLength < oXMLParent.attributes.length; nLength++) {
                var oAttrib = oXMLParent.attributes.item(nLength);
                vContent = {};
                var attribName = '';

                if (this.options.stripAttrPrefix) {
                    attribName = oAttrib.name.replace(this.prefixMatch, '');

                } else {
                    attribName = oAttrib.name;
                }

                if (this.options.grokAttr) {
                    vContent[this.options.valueKey] = this.grokType(oAttrib.value.replace(this.trimMatch, ''));
                } else {
                    vContent[this.options.valueKey] = oAttrib.value.replace(this.trimMatch, '');
                }

                if (this.options.xmlns && oAttrib.namespaceURI) {
                    vContent[this.options.namespaceKey] = oAttrib.namespaceURI;
                }

                if (this.options.attrsAsObject) { // attributes with same local name must enable prefixes
                    vAttribs[attribName] = vContent;
                } else {
                    vResult[this.options.attrKey + attribName] = vContent;
                }
            }

            if (this.options.attrsAsObject) {
                vResult[this.options.attrKey] = vAttribs;
            } else {}
        }

        // iterate over the children
        if (oXMLParent.hasChildNodes()) {
            for (var oNode, sProp, vContent, nItem = 0; nItem < oXMLParent.childNodes.length; nItem++) {
                oNode = oXMLParent.childNodes.item(nItem);

                if (oNode.nodeType === 4) {
                    if (this.options.mergeCDATA) {
                        sCollectedTxt += oNode.nodeValue;
                    } else {
                        if (vResult.hasOwnProperty(this.options.cdataKey)) {
                            if (vResult[this.options.cdataKey].constructor !== Array) {
                                vResult[this.options.cdataKey] = [vResult[this.options.cdataKey]];
                            }
                            vResult[this.options.cdataKey].push(oNode.nodeValue);

                        } else {
                            if (this.options.childrenAsArray) {
                                vResult[this.options.cdataKey] = [];
                                vResult[this.options.cdataKey].push(oNode.nodeValue);
                            } else {
                                vResult[this.options.cdataKey] = oNode.nodeValue;
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
                    if (this.options.stripElemPrefix) {
                        sProp = oNode.nodeName.replace(this.prefixMatch, '');
                    } else {
                        sProp = oNode.nodeName;
                    }

                    vContent = this.parseXML(oNode,opt);

                    if (vResult.hasOwnProperty(sProp)) {
                        if (vResult[sProp].constructor !== Array) {
                            vResult[sProp] = [vResult[sProp]];
                        }
                        vResult[sProp].push(vContent);

                    } else {
                        if (this.options.childrenAsArray) {
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
            if (this.options.childrenAsArray) {
                vResult[this.options.textKey] = [];
                vResult[this.options.textKey].push(null);
            } else {
                vResult[this.options.textKey] = null;
            }
        }

        if (sCollectedTxt) {
            if (this.options.grokText) {
                var value = this.grokType(sCollectedTxt.replace(this.trimMatch, ''));
                if (value !== null && value !== undefined) {
                    vResult[this.options.textKey] = value;
                }
            } else if (this.options.normalize) {
                vResult[this.options.textKey] = sCollectedTxt.replace(this.trimMatch, '').replace(/\s+/g, " ");
            } else {
                vResult[this.options.textKey] = sCollectedTxt.replace(this.trimMatch, '');
            }
        }

        return vResult;
    }
    public xmlToString(xmlDoc){
        try {
            var xmlString = xmlDoc.xml ? xmlDoc.xml : (new XMLSerializer()).serializeToString(xmlDoc);
            return xmlString;
        } catch (err) {
            return null;
        }
    }
    public stringToXML(xmlString){
        try {

            //if (window.DOMParser) {

            var dom = new DOMParser();
            var xmlDoc = dom.parseFromString(xmlString, "text/xml");
            return xmlDoc;
            //} else {
               // xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
               // xmlDoc.async = false;
               // xmlDoc.loadXML(xmlString);

               // return xmlDoc;
            //}
        } catch (e) {
            return null;
        }
    }
}