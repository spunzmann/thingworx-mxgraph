var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import * as JD from "./mtpJsonDefs";
var MtpFileParser = /** @class */ (function () {
    function MtpFileParser() {
    }
    MtpFileParser.prototype.loadFile = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var response, responseText, xmlData, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch(filePath)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.text()];
                    case 2:
                        responseText = _a.sent();
                        xmlData = new DOMParser().parseFromString(responseText, "text/xml");
                        return [2 /*return*/, this.parseMtpXml(xmlData)];
                    case 3:
                        e_1 = _a.sent();
                        console.error("Failed to load MTP");
                        throw e_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MtpFileParser.prototype.parseMtpXml = function (file) {
        var diagram = {
            pipes: [],
            elements: [],
            width: 0,
            height: 0
        };
        // find a referece to the diagram object
        //const hmiDiagramXml = file.querySelector('InstanceHierarchy[Name="HMI"] InternalElement[Name="Kat_Formulierung"]');
        //We consider the first InternalElement element from the HMI node as the HMI diagram in order not to add a widget property in the Composer
        var hmiDiagramXml = file.querySelector('InstanceHierarchy[Name="HMI"] InternalElement');
        if (!hmiDiagramXml) {
            throw "No hmi diagram found in given file";
        }
        diagram.width = this.getAttributeTagValue(hmiDiagramXml, "Width", true);
        diagram.height = this.getAttributeTagValue(hmiDiagramXml, "Height", true);
        // iterate through the internal elements of the diagram and add them to the diagram
        for (var i = 0; i < hmiDiagramXml.childElementCount; i++) {
            var element = hmiDiagramXml.children[i];
            if (element.nodeName == "InternalElement") {
                this.parseHmiInternalElement(element, diagram, file);
            }
        }
        return diagram;
    };
    MtpFileParser.prototype.parseHmiInternalElement = function (element, diagram, file) {
        // if there is a attribute with an edge path, assume it's a line
        if (this.getAttributeTagValue(element, "Edgepath", false)) {
            this.parseHmiPipe(element, diagram);
        }
        else if (this.getAttributeTagValue(element, "eClassClassificationClass", false)) {
            this.parseDiagramElement(element, diagram, file);
        }
    };
    MtpFileParser.prototype.parseDiagramElement = function (element, diagram, file) {
        var nozzles = this.getNozzleList(element);
        var visualElement = {
            viewType: this.getAttributeTagValue(element, "ViewType", false),
            eClassVersion: this.getAttributeTagValue(element, "eClassVersion", false),
            eClassClassification: this.getAttributeTagValue(element, "eClassClassificationClass", false),
            eClassIrdi: this.getAttributeTagValue(element, "eClassIRDI", false),
            refId: this.getAttributeTagValue(element, "RefID", false),
            id: element.getAttribute("ID"),
            name: element.getAttribute("Name"),
            width: this.getAttributeTagValue(element, "Width", true),
            height: this.getAttributeTagValue(element, "Height", true),
            rotation: this.getAttributeTagValue(element, "Rotation", true),
            x: this.getAttributeTagValue(element, "X", true),
            y: this.getAttributeTagValue(element, "Y", true),
            nozzles: nozzles,
            type: JD.ElementType.VISUAL_ELEMENT
        };
        // find the elements that are real nozzles 
        var realNozzles = nozzles.filter(function (el) { return el.baseClass == "MTPHMISUCLib/PortObject/Nozzle"; });
        if (realNozzles.length == 2) {
            // we will assume that the subelement will be positioned between this two realNozzles
            visualElement.subElement = {
                x: Math.min(realNozzles[0].x, realNozzles[1].x),
                y: Math.min(realNozzles[0].y, realNozzles[1].y),
                height: realNozzles[0].y < realNozzles[1].y ? realNozzles[1].y - realNozzles[0].y : realNozzles[0].y - realNozzles[1].y,
                width: Math.sqrt(Math.pow((realNozzles[0].x - realNozzles[1].x), 2) + Math.pow((realNozzles[0].y - realNozzles[1].y), 2)),
                rotation: visualElement.rotation // inherit the rotation from the parent
            };
            // TODO: decide on when the height or width will be 0
            if (visualElement.subElement.height < 1) {
                visualElement.subElement.height = 10;
            }
            if (visualElement.subElement.width < 1) {
                visualElement.subElement.width = 10;
            }
        }
        // we need to now search for the communication
        var communicationElementAttr = file.evaluate("//InstanceHierarchy[@Name=\"ModuleTypePackage\"]//InternalElement[@Name=\"Communication\"]" +
            ("/InternalElement[@Name=\"InstanceList\"]//Attribute[@Name=\"RefID\"][Value=\"" + visualElement.refId + "\"]"), file, null, XPathResult.ANY_TYPE, null).iterateNext();
        var communicationElement = communicationElementAttr ? communicationElementAttr.parentElement : undefined;
        var communicationObject = undefined;
        if (communicationElement != null) {
            var communicationDescription = communicationElement.querySelector("Description").textContent;
            var interfaceList = [];
            // interate through the attributes and try to get each communication element
            for (var i = 0; i < communicationElement.childElementCount; i++) {
                var attrElement = communicationElement.children[i];
                if (attrElement.nodeName == "Attribute" && attrElement.getAttribute("Node") != "RefID") {
                    var attrValue = attrElement.getElementsByTagName("Value")[0].textContent;
                    // search for this attribute in the communication lib
                    var sourceCommunicationElement = file.querySelector("InstanceHierarchy[Name=\"ModuleTypePackage\"] InternalElement[Name=\"Communication\"] " +
                        ("InternalElement[Name=\"SourceList\"]  ExternalInterface[ID=\"" + attrValue + "\"]"));
                    if (sourceCommunicationElement) {
                        interfaceList.push({
                            access: this.getAttributeTagValue(sourceCommunicationElement, "Access", false),
                            identifier: this.getAttributeTagValue(sourceCommunicationElement, "Identifier", false),
                            namespace: this.getAttributeTagValue(sourceCommunicationElement, "Namespace", false),
                            type: JD.ElementType.COMMUNICATION_INTERFACE,
                            id: sourceCommunicationElement.getAttribute("ID"),
                            name: attrElement.getAttribute("Name"),
                            endpoint: this.getAttributeTagValue(sourceCommunicationElement.parentElement, "Endpoint", false)
                        });
                    }
                }
            }
            communicationObject = {
                description: communicationDescription,
                interfaces: interfaceList,
                type: JD.ElementType.COMMUNICATION_OBJECT,
                id: communicationElement.getAttribute("ID"),
                name: communicationElement.getAttribute("Name")
            };
        }
        if (communicationObject) {
            diagram.elements.push({ communication: communicationObject, obj: visualElement });
        }
        else {
            diagram.elements.push({ obj: visualElement });
        }
    };
    MtpFileParser.prototype.parseHmiPipe = function (element, diagram) {
        var pipe = {
            id: element.getAttribute("ID"),
            name: element.getAttribute("Name"),
            type: JD.ElementType.PIPE
        };
        // get the parsed path
        var parsedPath = this.parseEdgePath(this.getAttributeTagValue(element, "Edgepath", false));
        // parse the nozzles
        pipe.nozzles = this.getNozzleList(element);
        // check to see if the the source and target points form the path are equal to a nozzle
        for (var _i = 0, _a = pipe.nozzles; _i < _a.length; _i++) {
            var nozzle = _a[_i];
            if (parsedPath.source.equals(nozzle)) {
                pipe.source = nozzle;
            }
            if (parsedPath.target.equals(nozzle)) {
                pipe.target = nozzle;
            }
        }
        // check if the soruce and target were assigned
        if (!pipe.source) {
            pipe.source = parsedPath.source;
        }
        if (!pipe.target) {
            pipe.target = parsedPath.target;
        }
        pipe.waypoints = parsedPath.waypoints;
        diagram.pipes.push(pipe);
    };
    MtpFileParser.prototype.getNozzleList = function (element) {
        var nozzles = [];
        for (var j = 0; j < element.childElementCount; j++) {
            var subElement = element.children[j];
            if (subElement.nodeName == "InternalElement") {
                nozzles.push({
                    id: subElement.getAttribute("ID"),
                    name: subElement.getAttribute("Name"),
                    x: this.getAttributeTagValue(subElement, "X", true),
                    y: this.getAttributeTagValue(subElement, "Y", true),
                    externalConnectorId: element.querySelector('ExternalInterface[Name="Connector"]').getAttribute("ID"),
                    baseClass: subElement.getAttribute("RefBaseSystemUnitPath"),
                    type: JD.ElementType.NOZZLE
                });
            }
        }
        return nozzles;
    };
    /**
     * Computes a list of points into a start, end and intermidiate points
     */
    MtpFileParser.prototype.parseEdgePath = function (edgePath) {
        var tokens = edgePath.split(";");
        return {
            source: new JD.Point(tokens[0]),
            target: new JD.Point(tokens[tokens.length - 1]),
            waypoints: tokens.slice(1, -1).map(function (el) { return new JD.Point(el); })
        };
    };
    /**
     * XML parsing fucntion, helping getting the Value tag of a Attribute tag identified by the attrName
     */
    MtpFileParser.prototype.getAttributeTagValue = function (parent, attrName, asNumber) {
        var value = parent.querySelector("Attribute[Name=\"" + attrName + "\"] > Value");
        if (value) {
            if (asNumber && value.textContent) {
                return parseFloat(value.textContent);
            }
            else {
                return value.textContent;
            }
        }
    };
    return MtpFileParser;
}());
export { MtpFileParser };
//# sourceMappingURL=mtpFileParser.js.map