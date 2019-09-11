//importing the mxgraph namespace since in the mx
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
import { execute } from "./jsconverts/shapeCatalogue";
import { MtpFileParser } from "./jsconverts/mtpFileParser";
//import {MtpJsonToMxGraph} from "./jsconverts/mtpJsonToMxGraph"
import { MtpJsonToMxGraph } from "./jsconverts/mtpJsonToMxGraph";
TW.Runtime.Widgets.mxdiagram = function () {
    var valueProcessDiagramLoader, xmlDiagramLoader;
    var diagramWdg;
    //added by Vladimir from the MTPFileController.js
    var fileLoader;
    var diagramRenderer;
    var eClassShapeMap = {};
    var graph;
    //end section variable declaration
    // a list of resources that are hold by the current graph
    var currentGraphResources = [];
    var resizeInterval;
    //this function is the shapeCatalogue.js
    this.execute = execute;
    window["MtpJsonToMxGraph"] = MtpJsonToMxGraph;
    window["MtpFileParser"] = MtpFileParser;
    //Finish section mptFileParser. ts
    this.initializeResponsiveContainer = function (element) {
        var _this = this;
        // whenever the element resizes, we must be responsive.
        // so watch for element resizes via an interval
        function onResize(element, callback) {
            var height = element.clientHeight;
            var width = element.clientWidth;
            return setInterval(function () {
                if (element.clientHeight != height || element.clientWidth != width) {
                    height = element.clientHeight;
                    width = element.clientWidth;
                    callback();
                }
            }, 500);
        }
        resizeInterval = onResize(element, function () {
            if (_this.graph) {
                _this.graph.doResizeContainer(element.clientWidth, element.clientHeight);
                _this.graph.fit();
            }
        });
    };
    this.renderHtml = function () {
        return '<div class="widget-content widget-mxgraph"></div>';
    };
    this.runtimeProperties = function () {
        return {
            needsDataLoadingAndError: true,
        };
    };
    this.afterRender = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.boundingBox.css({ width: "100%", height: "100%" });
                        _a = this;
                        return [4 /*yield*/, import("./generic/mxGraphImport")];
                    case 1:
                        _a.mxGraphNamespace = _c.sent();
                        _b = this;
                        return [4 /*yield*/, import('./generic/mxGraphUtils')];
                    case 2:
                        _b.mxGraphUtils = _c.sent();
                        //adding the Mashup did finish loading section 
                        diagramWdg = this;
                        diagramWdg.graphChanged = function (newGraph) {
                            diagramRenderer.initGraph(newGraph);
                            newGraph.refresh();
                            newGraph.getView().revalidate();
                            graph = newGraph;
                        };
                        return [2 /*return*/];
                }
            });
        });
    };
    this.updateProperty = function (updatePropertyInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, container, currentGraph, container_1, currentGraph_1, data, graphCells, i, cellId, value, fillColor, strokeColor, cell, style, str_MTPFilePath, key, diagram;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawDataFromInvoke);
                        _a = updatePropertyInfo.TargetProperty;
                        switch (_a) {
                            case 'ValueDiagram': return [3 /*break*/, 1];
                            case 'XMLDiagram': return [3 /*break*/, 4];
                            case 'JSONArrayGraphCells': return [3 /*break*/, 7];
                            case "MTPFilePath": return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 10];
                    case 1:
                        if (!!valueProcessDiagramLoader) return [3 /*break*/, 3];
                        return [4 /*yield*/, import('./value_process/mxValueProcessDiagram')];
                    case 2:
                        valueProcessDiagramLoader = _b.sent();
                        _b.label = 3;
                    case 3:
                        this.resetCurrentGraph();
                        container = this.jqElement[0];
                        currentGraph = valueProcessDiagramLoader.createValueProcessDiagram(container, updatePropertyInfo.RawDataFromInvoke);
                        this.setNewActiveGraph(currentGraph);
                        return [3 /*break*/, 10];
                    case 4:
                        if (!!xmlDiagramLoader) return [3 /*break*/, 6];
                        return [4 /*yield*/, import('./xml_codec/mxGraphXmlDiagram')];
                    case 5:
                        xmlDiagramLoader = _b.sent();
                        _b.label = 6;
                    case 6:
                        this.resetCurrentGraph();
                        container_1 = this.jqElement[0];
                        currentGraph_1 = xmlDiagramLoader.createGraphFromXML(container_1, updatePropertyInfo.SinglePropertyValue, this.getProperty("CustomShapesXMLPath"), this.getProperty("AutoLayout"), this.getProperty("EdgeStyle"));
                        this.setNewActiveGraph(currentGraph_1);
                        return [3 /*break*/, 10];
                    case 7:
                        {
                            if (this.graph == null) {
                                return [3 /*break*/, 10];
                            }
                            data = updatePropertyInfo.SinglePropertyValue;
                            graphCells = JSON.parse(updatePropertyInfo.RawSinglePropertyValue);
                            for (i = 0; i < graphCells.length; i++) {
                                cellId = graphCells[i].id;
                                value = graphCells[i].value;
                                fillColor = graphCells[i].fillColor;
                                strokeColor = graphCells[i].strokeColor;
                                cell = this.getGraphCell(this.graph.getModel().cells, cellId);
                                cell.value.setAttribute("label", value);
                                style = cell.getStyle();
                                this.setCellColor(cell, fillColor, "fillColor");
                                this.setCellColor(cell, strokeColor, "strokeColor");
                                this.graph.refresh(cell);
                            }
                            return [3 /*break*/, 10];
                        }
                        _b.label = 8;
                    case 8:
                        str_MTPFilePath = updatePropertyInfo.SinglePropertyValue;
                        if (!fileLoader) {
                            // add all of mxgraph to window
                            for (key in diagramWdg.mxGraphNamespace.mxgraph) {
                                if (diagramWdg.mxGraphNamespace.mxgraph.hasOwnProperty(key)) {
                                    window[key] = diagramWdg.mxGraphNamespace.mxgraph[key];
                                }
                            }
                            fileLoader = new MtpFileParser();
                            diagramRenderer = new MtpJsonToMxGraph(diagramWdg.mxGraphNamespace.mxgraph, diagramWdg.jqElement[0], eClassShapeMap);
                            diagramWdg.execute();
                        }
                        diagramWdg.resetCurrentGraph();
                        return [4 /*yield*/, fileLoader.loadFile("/Thingworx/FileRepositories/MtpFileRepository/" + str_MTPFilePath)];
                    case 9:
                        diagram = _b.sent();
                        graph = diagramRenderer.drawMpt(diagram);
                        this.setProperty("mtpJson", JSON.stringify(diagram));
                        diagramWdg.setNewActiveGraph(graph);
                        diagramWdg.serviceInvoked("GenerateXML");
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    this.setCellColor = function (cell, color, colorType) {
        var style = cell.getStyle();
        var styleBeforeColor = style.substring(0, style.indexOf(colorType + "=") + (colorType + "=").length);
        var styleAfterColor = style.substring(style.indexOf(colorType + "=") + (colorType + "=").length + "#ffffff".length, style.length);
        var newStyle = styleBeforeColor + color + styleAfterColor;
        cell.setStyle(newStyle);
    };
    this.getGraphCell = function (cells, cellId) {
        var foundCell;
        for (var cellIterator in cells) {
            if (cells.hasOwnProperty(cellIterator)) {
                var cell = cells[cellIterator];
                if (cell.value != undefined && cell.value.getAttribute && cell.value.getAttribute("customId") == cellId) {
                    foundCell = cell;
                    break;
                }
            }
        }
        if (!foundCell) {
            foundCell = cells[cellId];
        }
        return foundCell;
    };
    this.graphChanged = function (graph) {
        // empty function be overriden when in a script for example
    };
    this.setNewActiveGraph = function (newGraph) {
        this.graph = newGraph;
        this.initializeEventListener(newGraph);
        currentGraphResources.push(newGraph);
        if (this.mxGraphUtils && this.getProperty('ShowTools')) {
            currentGraphResources.push(this.mxGraphUtils.CreateGraphToolbar(newGraph));
        }
        if (this.mxGraphUtils && this.getProperty('ShowOutline')) {
            currentGraphResources.push(this.mxGraphUtils.CreateGraphOutline(newGraph));
        }
        if (this.mxGraphUtils) {
            this.setProperty("XMLDiagram", this.mxGraphUtils.exportGraphAsXml(newGraph));
        }
        if (this.getProperty("AutoFit")) {
            this.graph.fit();
            this.initializeResponsiveContainer(this.boundingBox[0]);
        }
        this.graphChanged(newGraph);
    };
    this.initializeEventListener = function (graph) {
        var thisWidget = this;
        graph.addListener('labelChanged', function (sender, evt) {
            var cell = evt.getProperty('cell');
            if (cell != null) {
                if (cell.value.id) {
                    thisWidget.setProperty("EditedCellId", cell.value.id + "-" + cell.value.key);
                }
                else {
                    thisWidget.setProperty("EditedCellId", cell.parent.value.id + "-" + cell.value.key);
                }
                thisWidget.setProperty("EditedCellNewLabel", cell.value.value);
                thisWidget.jqElement.triggerHandler('CellLabelChanged');
            }
        });
        graph.getSelectionModel().addListener('change', function (sender, evt) {
            var cells = evt.getProperty('removed') || [];
            for (var i = 0; i < cells.length; i++) {
                var cell = cells[i];
                if (cell) {
                    if (cell.value && cell.value.getAttribute) {
                        thisWidget.setProperty("SelectedCellId", cell.value.getAttribute("customId"));
                        thisWidget.jqElement.triggerHandler('SelectedCellChanged');
                    }
                    else {
                        thisWidget.setProperty("SelectedCellId", cell.id);
                        thisWidget.jqElement.triggerHandler('SelectedCellChanged');
                    }
                }
            }
        });
        graph.addListener('doubleClick', function (sender, evt) {
            var cell = evt.getProperty('cell');
            if (cell) {
                if (cell.value && cell.value.getAttribute) {
                    thisWidget.setProperty("SelectedCellId", cell.value.getAttribute("customId"));
                    thisWidget.jqElement.triggerHandler('CellDoubleClicked');
                }
                else {
                    thisWidget.setProperty("SelectedCellId", cell.id);
                    thisWidget.jqElement.triggerHandler('CellDoubleClicked');
                }
            }
        });
    };
    this.serviceInvoked = function (serviceName) {
        if (serviceName == "GenerateXML") {
            this.setProperty("XMLDiagram", this.mxGraphUtils.exportGraphAsXml(this.graph));
        }
        else if (serviceName == "UpdateGraph") {
        }
    };
    this.resetCurrentGraph = function () {
        for (var _i = 0, currentGraphResources_1 = currentGraphResources; _i < currentGraphResources_1.length; _i++) {
            var object = currentGraphResources_1[_i];
            object.destroy();
        }
    };
    this.beforeDestroy = function () {
        clearInterval(resizeInterval);
        this.resetCurrentGraph();
    };
};
//# sourceMappingURL=mxdiagram.runtime.js.map