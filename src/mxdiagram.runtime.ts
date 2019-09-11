import {execute} from "./jsconverts/shapeCatalogue"
import {MtpFileParser} from "./jsconverts/mtpFileParser"
import * as MtpJsonToMxGraph from "./jsconverts/mtpJsonToMxGraph"
import { mxgraph } from "./generic/mxGraphImport"


TW.Runtime.Widgets.mxdiagram = function () {
    let valueProcessDiagramLoader, xmlDiagramLoader;
    let diagramWdg: any;
    //added by Vladimir from the MTPFileController.js
    let fileLoader: MtpFileParser;
    let diagramRenderer: MtpJsonToMxGraph.MtpJsonToMxGraph;
    let eClassShapeMap: any = {};
    let graph: any;
    //end section variable declaration

    // a list of resources that are hold by the current graph
    let currentGraphResources = [];
    let resizeInterval;
    //this function is defined in the shapeCatalogue.js
    this.execute=execute;

    interface Window {
        MtpJsonToMxGraph: typeof MtpJsonToMxGraph
    }
    window["MtpJsonToMxGraph"] = MtpJsonToMxGraph;

    interface Window {
        MtpFileParser: typeof MtpFileParser
    }
    window["MtpFileParser"] = MtpFileParser;
    //Finish section mptFileParser. ts
    
    this.initializeResponsiveContainer = function (element: HTMLElement) {
        // whenever the element resizes, we must be responsive.
        // so watch for element resizes via an interval
        function onResize(element, callback) {
            let height = element.clientHeight;
            let width = element.clientWidth;

            return setInterval(() => {
                if (element.clientHeight != height || element.clientWidth != width) {
                    height = element.clientHeight;
                    width = element.clientWidth;
                    callback();
                }
            }, 500);
        }
        resizeInterval = onResize(element, () => {
            if (this.graph) {
                this.graph.doResizeContainer(element.clientWidth, element.clientHeight);
                this.graph.fit();
            }
        });
    }

    this.getStencilNames= function(files: string[]) {
        var iftbl_StencilNames :{[k: string]: any} ={};
        iftbl_StencilNames = {
                        'dataShape': {
                            fieldDefinitions: {
                                "LongShapeName": {
                                    "name": "LongShapeName",
                                    "description": "use this for mapping",
                                    "baseType": "STRING",
                                    "ordinal": 2,
                                    "aspects": {
                                        "isPrimaryKey": false,
                                        "friendlyName": "Shape Name (long)"
                                    }
                                },
                                "ShapeCategory": {
                                    "name": "ShapeCategory",
                                    "description": "example: mxgraph.pid.agitators",
                                    "baseType": "STRING",
                                    "ordinal": 3,
                                    "aspects": {
                                        "isPrimaryKey": false,
                                        "friendlyName": "Shape Category"
                                    }
                                },
                                "ShortShapeName": {
                                    "name": "ShortShapeName",
                                    "description": "example: Agitator, Stirrer. This is formatted in the Shape Name (long)",
                                    "baseType": "STRING",
                                    "ordinal": 1,
                                    "aspects": {
                                        "isPrimaryKey": false,
                                        "friendlyName": "Shape Name (short)"
                                    }
                                }},
                            name: ' MXgraph.ShapeList.DataShape',
                            description: 'MX graph embedded widgetshape list'
                        },
                        'name': 'Stencil Names',
                        'description': 'list of the shapes embedded in the widget',
                        'rows': []
                    };
        
        for (const filePath of files) {
            let req = mxgraph.mxUtils.load(filePath);
            let root = req.getDocumentElement();
            let prefix = root.getAttribute("name");
            let shape = root.firstChild;

            while (shape != null) {
                if (shape.nodeType == mxgraph.mxConstants.NODETYPE_ELEMENT) {
                    let name = prefix + '.' + shape.getAttribute('name').replace(/ /g, '_');
                    //this.mxgraph.mxStencilRegistry.addStencil(name.toLowerCase(), new this.mxgraph.mxStencil(shape));
                    var row : {[k: string]: any}={};
                    row.ShortShapeName = shape.getAttribute('name');
                    row.ShapeCategory =prefix;
                    row.LongShapeName = name.toLowerCase();
                    iftbl_StencilNames.rows.push(row);
                }
                shape = shape.nextSibling;
            }
        }
        return iftbl_StencilNames;
    }

    this.renderHtml = function () {
        return '<div class="widget-content widget-mxgraph"></div>';
    };

    this.runtimeProperties = function () {
        return {
            needsDataLoadingAndError: true,
        };
    }

    this.afterRender = async function () {
        this.boundingBox.css({ width: "100%", height: "100%" });
        this.mxGraphNamespace = await import("./generic/mxGraphImport");
        this.mxGraphUtils = await import('./generic/mxGraphUtils');
        //adding the Mashup did finish loading section 
        diagramWdg =this;
        diagramWdg.graphChanged = (newGraph: any) => {
        diagramRenderer.initGraph(newGraph);
        newGraph.refresh();
        newGraph.getView().revalidate();
        graph = newGraph;
         }
    }

    this.updateProperty = async function (updatePropertyInfo) {
        this.setProperty(updatePropertyInfo.TargetProperty, updatePropertyInfo.RawDataFromInvoke);
        switch (updatePropertyInfo.TargetProperty) {
            case 'ValueDiagram':
                if (!valueProcessDiagramLoader) {
                    valueProcessDiagramLoader = await import('./value_process/mxValueProcessDiagram');
                }
                this.resetCurrentGraph();
                let container = this.jqElement[0];
                let currentGraph = valueProcessDiagramLoader.createValueProcessDiagram(container, updatePropertyInfo.RawDataFromInvoke);
                this.setNewActiveGraph(currentGraph);
                break;
            case 'XMLDiagram': {
                if (!xmlDiagramLoader) {
                    xmlDiagramLoader = await import('./xml_codec/mxGraphXmlDiagram');
                }
                this.resetCurrentGraph();
                let container = this.jqElement[0];
                let currentGraph = xmlDiagramLoader.createGraphFromXML(container, updatePropertyInfo.SinglePropertyValue,
                    this.getProperty("CustomShapesXMLPath"), this.getProperty("AutoLayout"), this.getProperty("EdgeStyle"));
                this.setNewActiveGraph(currentGraph);
                break;
            }
            case 'JSONArrayGraphCells': {
                if (this.graph == null) {
                    break;
                }

                var data = updatePropertyInfo.SinglePropertyValue;
                var graphCells = JSON.parse(updatePropertyInfo.RawSinglePropertyValue);

                for (var i = 0; i < graphCells.length; i++) {
                    var cellId = graphCells[i].id;
                    var value = graphCells[i].value;
                    var fillColor = graphCells[i].fillColor;
                    var strokeColor = graphCells[i].strokeColor;

                    var cell = this.getGraphCell(this.graph.getModel().cells, cellId);
                    cell.value.setAttribute("label", value);
                    var style = cell.getStyle();
                    this.setCellColor(cell, fillColor, "fillColor");
                    this.setCellColor(cell, strokeColor, "strokeColor");

                    this.graph.refresh(cell);
                }

                break;
            }
            case "MTPFilePath":
                {
                    var str_MTPFilePath = updatePropertyInfo.SinglePropertyValue;
                    if (!fileLoader) {
                        // add all of mxgraph to window
                        for (const key in diagramWdg.mxGraphNamespace.mxgraph) {
                            if (diagramWdg.mxGraphNamespace.mxgraph.hasOwnProperty(key)) {
                                window[key] = diagramWdg.mxGraphNamespace.mxgraph[key]
                            }
                        }
                        fileLoader = new MtpFileParser();
                        diagramRenderer = new MtpJsonToMxGraph.MtpJsonToMxGraph(diagramWdg.mxGraphNamespace.mxgraph, diagramWdg.jqElement[0], eClassShapeMap);
                        //we populate the MXGraph shape list property that allows getting all the stencil names
                        this.setProperty("MXGraphShapeList",this.getStencilNames(MtpJsonToMxGraph.STENCIL_LIST.map((el) => { return MtpJsonToMxGraph.STENCIL_PATH + el })));
                        diagramWdg.execute();
                    }
                    diagramWdg.resetCurrentGraph();
                    // load the xml file and parse it into a document
                    let diagram = await fileLoader.loadFile(`/Thingworx/FileRepositories/MtpFileRepository/${str_MTPFilePath}`);
                    graph = diagramRenderer.drawMpt(diagram);
                    this.setProperty("mtpJson",JSON.stringify(diagram));
                    diagramWdg.setNewActiveGraph(graph);
                    diagramWdg.serviceInvoked("GenerateXML");
                    break;
                }
            case "ShapeMapping":
                {
                    var iftbl_Mappings = updatePropertyInfo.ActualDataRows;
                    for (var z=0;z<iftbl_Mappings.length;z++) {
                        var row = iftbl_Mappings[z];
                        eClassShapeMap[row.eclass] = row.mxgraphShape;
                    }
                    break;
                }
                case "MTPData":
                        {
                            if (!graph) {
                                return;
                            }
                            var iftbl_Data = updatePropertyInfo.ActualDataRows;
                            for (const row of iftbl_Data) {
                                let cell = graph.getModel().getCell(row.elementId);
                                if (cell && cell.hasAttribute("label")) {
                                    cell.setAttribute("value", isNaN(row.value) ? row.value : parseFloat(row.value).toFixed(2));
                                    graph.getModel().setValue(cell, cell.value);
                                    
                                }
                            }
                            break;
                        }
        }
    }

    this.setCellColor = function (cell, color, colorType) {
        var style = cell.getStyle();
        var styleBeforeColor = style.substring(0, style.indexOf(colorType + "=") + (colorType + "=").length);
        var styleAfterColor = style.substring(style.indexOf(colorType + "=") + (colorType + "=").length + "#ffffff".length, style.length);
        var newStyle = styleBeforeColor + color + styleAfterColor;
        cell.setStyle(newStyle);
    }

    this.getGraphCell = function (cells, cellId) {
        var foundCell;
        for (const cellIterator in cells) {
            if (cells.hasOwnProperty(cellIterator)) {
                const cell = cells[cellIterator];
                if (cell.value != undefined && cell.value.getAttribute && cell.value.getAttribute("customId") == cellId) {
                    foundCell = cell;
                    break;
                }
            }
        }
        if(!foundCell) {
            foundCell = cells[cellId]
        }

        return foundCell;

    }

    this.graphChanged = function (graph) {
        // empty function be overriden when in a script for example
    }

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
        let thisWidget = this;
        graph.addListener('labelChanged', function (sender, evt) {
            let cell = evt.getProperty('cell');

            if (cell != null) {
                if (cell.value.id) {
                    thisWidget.setProperty("EditedCellId", cell.value.id + "-" + cell.value.key);
                } else {
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
                    } else {
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
                } else {
                    thisWidget.setProperty("SelectedCellId", cell.id);
                    thisWidget.jqElement.triggerHandler('CellDoubleClicked');
                }
            }
        });
    }

    this.serviceInvoked = function (serviceName) {
        if (serviceName == "GenerateXML") {
            this.setProperty("XMLDiagram", this.mxGraphUtils.exportGraphAsXml(this.graph));
        }
        else if (serviceName=="UpdateGraph")
        {
            
        }
    }
    this.resetCurrentGraph = function () {
        for (const object of currentGraphResources) {
            object.destroy();
        }
    }

    this.beforeDestroy = function () {
        clearInterval(resizeInterval);
        this.resetCurrentGraph();
    }

   


   

 
}