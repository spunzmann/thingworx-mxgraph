const NOZZLE_WIDTH = 5;
const NOZZLE_HEIGHT = 5;
export const STENCIL_PATH = "/Thingworx/Common/extensions/mxdiagram_ExtensionPackage/ui/mxdiagram/resources/stencils/";
export const STENCIL_LIST = ['agitators.xml', 'apparatus_elements.xml', 'agitators.xml', 'centrifuges.xml', 'compressors.xml',
    'compressors_iso.xml', 'crushers_grinding.xml', 'driers.xml', 'engines.xml', 'feeders.xml', 'filters.xml', 'fittings.xml',
    'flow_sensors.xml', 'heat_exchangers.xml', 'instruments.xml', 'misc.xml', 'mixers.xml', 'piping.xml', 'feeders.xml', 'feeders.xml',
    'pumps.xml', 'pumps_din.xml', 'pumps_iso.xml', 'separators.xml', 'shaping_machines.xml', 'valves.xml', 'vessels.xml'];

    import { mxgraph } from "../generic/mxGraphImport"
    import * as JD from "./mtpJsonDefs"

    
/**
 * A MtpFileLoader handles loading a mtp file from the given link, 
 * parsing it into an mxgraph graph object and retring it.
 */
export class MtpJsonToMxGraph {
    private mxgraph: any;
    private container: HTMLElement;
    /**
     *  Intializes the MtpFileLoader with the mxgraph namespace
     */
    constructor(mxGraphNamespace: any, container: HTMLElement) {
        this.mxgraph = mxGraphNamespace;
        this.container = container;
        // load all the stencils
        this.loadStencilFiles(STENCIL_LIST.map((el) => { return STENCIL_PATH + el }));
    }

    public drawMpt(mtpDiagram: JD.HmiDiagram): any {
        try {
            let graph = this.initGraph(new this.mxgraph.mxGraph(this.container));
            this.drawPipes(graph, graph.getDefaultParent(), mtpDiagram.pipes);
            this.drawElements(graph, graph.getDefaultParent(), mtpDiagram.elements);
            return graph;
        } catch (e) {
            console.error(`Failed to draw mxgraph for MTP [Reason: ${e.message}]`)
            throw e;
        }
    }

    private drawElements(graph: any, parent: any, elements: JD.InteractibleElement[]) {
        for (const element of elements) {
            if (element.obj.subElement) {
                // draw the element first (container then the subelement)
                // depending on the rotation of the element we need to offset it across that axis
                let elementOffsetX = element.obj.subElement.height / 2 * Math.abs(Math.sin(element.obj.rotation * Math.PI / 180));
                let elementOffsetY = NOZZLE_HEIGHT * Math.abs(Math.cos(element.obj.rotation * Math.PI / 180));
                //the following commented block alters the position of the drawn element in order to allow the correct positioning if the connection points ARE NOT horizontal (ie: the pipe is at an angle)
                //this requires some debugging, as it did not work ok
              /*   graph.insertVertex(parent, element.obj.id, element.obj.name, element.obj.subElement.x - elementOffsetX, element.obj.subElement.y - elementOffsetY,
                    element.obj.subElement.width, element.obj.subElement.height, `element;shape=${this.shapeMap[element.obj.eClassClassification]};rotation=${element.obj.rotation}`);
              */
                graph.insertVertex(
                    parent,
                    element.obj.id, 
                    element.obj.name, 
                    element.obj.x, 
                    element.obj.y,
                    element.obj.width, 
                    element.obj.height, 
                    `element;shape=${element.obj.mxGraphShape};rotation=${element.obj.rotation}`
                );
            } else {
                // if we don't have a sub-element, draw the visual object directly
                graph.insertVertex(
                    parent,
                    element.obj.id,
                    element.obj.name, 
                    element.obj.x, 
                    element.obj.y,
                    element.obj.width, 
                    element.obj.height, 
                    `element;shape=${element.obj.mxGraphShape};rotation=${element.obj.rotation}`
                );
            }

            if (element.communication) {
                // draw the parent first 
                let elParent = graph.insertVertex(
                    parent, 
                    element.communication.id, 
                    element.communication.name, 
                    element.obj.x, 
                    element.obj.y,
                    element.obj.width, 
                    element.obj.height, 
                    "swimlane;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;collapsible=1;resizeParentMax=0;resizeLast=0;"
                );
                elParent.collapsed = true;

                // if we have communication elements, draw them in the container
                for (const communicationIfc of element.communication.interfaces) {
                    let value = document.createElement("Value");
                    value.setAttribute('label', communicationIfc.name);
                    let cell = graph.insertVertex(
                        elParent, 
                        communicationIfc.id, 
                        value, 
                        0, 
                        0, 
                        element.obj.width, 
                        20, 
                        "interfaceValue"
                    );
                }
            }
        }
    }

    private drawPipes(graph: any, parent: any, pipes: JD.PipeDefinition[]) {
        for (const pipe of pipes) {
            // keep a map of the nozzles
            let nozzleMap: { [key: string]: any } = {};
            // draw the nozzles first, then the pipe itself
            for (const nozzle of pipe.nozzles) {
                nozzleMap[nozzle.id] = graph.insertVertex(parent, nozzle.id, nozzle.name,
                    nozzle.x - NOZZLE_WIDTH / 2, nozzle.y - NOZZLE_HEIGHT / 2, NOZZLE_WIDTH, NOZZLE_HEIGHT, nozzle.type);
            }
            // draw the pipe itself, but make sure that it's either connected to a nozzle or to a point
            let edge = new this.mxgraph.mxCell(pipe.name, new this.mxgraph.mxGeometry(), pipe.type);
            edge.setId(pipe.id);
            edge.setEdge(true);
            edge.geometry.relative = true;
            // set the  waypoints
            edge.geometry.points = pipe.waypoints.map((point) => { return new this.mxgraph.mxPoint(point.x, point.y) });
            // soruce and target point to the vertex or to nothing
            let source = undefined;
            let target = undefined;
            if (JD.isNozzle(pipe.source)) {
                source = nozzleMap[pipe.source.id];
            } else {
                // set the starting point a a point
                edge.geometry.sourcePoint = new this.mxgraph.mxPoint(pipe.source.x, pipe.source.y);
            }
            if (JD.isNozzle(pipe.target)) {
                target = nozzleMap[pipe.target.id];
            } else {
                // set the target point a a point
                edge.geometry.targetPoint = new this.mxgraph.mxPoint(pipe.target.x, pipe.target.y);
            }
            graph.addEdge(edge, parent, source, target);
        }
    }

    public initGraph(graph: any): any {
        // Allow panning using the right click buttion
        graph.setPanning(true);
        // enable the display of tooltips
        graph.setTooltips(true);
        // disable new connections and cloning cells, as well as drag and drop outside
        graph.setConnectable(false);
        graph.setCellsCloneable(true);
        graph.setCellsDeletable(true);
        graph.setDropEnabled(true);
        graph.setSplitEnabled(false);
        graph.setGridEnabled(false);
        graph.resetEdgesOnConnect = false;

        this.declareMxGraphStyles(graph);
        graph.getModel().prefix = "autoGenerated";

        graph.getLabel = function (cell: any) {
            if (cell) {
                // get the name of style
                let cellStyle = cell.style ? (cell.style.split(";") ? cell.style.split(";")[0] : cell.style) : undefined;
                if (cellStyle == "interfaceValue") {
                    return `${cell.getAttribute("label")}: ${cell.getAttribute("value", "N/A")}`;
                } else if (cellStyle == "Nozzle") {
                    return "";
                } else if (cellStyle == "element") {
                    return "";
                } else if (cell.edge) {
                    return ""
                } else {
                    return cell.value;
                }
            }
        }

        let layout = new this.mxgraph.mxStackLayout(graph, true);
        layout.resizeParent = true;
        layout.horizontal = false;
        layout.spacing = 2;
        let layoutMgr = new this.mxgraph.mxLayoutManager(graph);
        layoutMgr.getLayout = function (cell: any) {
            let cellStyle = cell.style ? (cell.style.split(";") ? cell.style.split(";")[0] : cell.style) : undefined;
            if (cellStyle == "swimlane") {
                return layout;
            }

            return null;
        };

        return graph;
    }

    /**
     * Creates the generic styles for elements
     */
    private declareMxGraphStyles(graph: any) {
        let style = graph.getStylesheet().getDefaultVertexStyle();
        style[this.mxgraph.mxConstants.STYLE_ROUNDED] = false;
        style[this.mxgraph.mxConstants.STYLE_FONTCOLOR] = '#1d1b1b';
        style[this.mxgraph.mxConstants.STYLE_STROKECOLOR] = '#9673A6';
        style[this.mxgraph.mxConstants.STYLE_FILLCOLOR] = '#f3f4f9';


        style = this.mxgraph.mxUtils.clone(style);
        style[this.mxgraph.mxConstants.STYLE_SHAPE] = 'swimlane';
        style[this.mxgraph.mxConstants.STYLE_STARTSIZE] = 20;
        graph.getStylesheet().putCellStyle('swimlane', style);

        style = [];
        style[this.mxgraph.mxConstants.STYLE_STROKECOLOR] = 'red';
        style[this.mxgraph.mxConstants.STYLE_SHAPE] = "ellipse";
        graph.getStylesheet().putCellStyle('Nozzle', style);

        style = [];
        style[this.mxgraph.mxConstants.STYLE_FILLCOLOR] = 'none';
        style[this.mxgraph.mxConstants.STYLE_STROKECOLOR] = 'none';
        graph.getStylesheet().putCellStyle('interfaceValue', style);

        style = graph.getStylesheet().getDefaultEdgeStyle();
        style[this.mxgraph.mxConstants.STYLE_ENDARROW] = 'none';
        style[this.mxgraph.mxConstants.STYLE_STROKEWIDTH] = 2;
    }
    /**
     * Loads the stencil files for pid diagrams
     */
    private loadStencilFiles(files: string[]) {
        for (const filePath of files) {
            let req = this.mxgraph.mxUtils.load(filePath);
            let root = req.getDocumentElement();
            let prefix = root.getAttribute("name");
            let shape = root.firstChild;

            while (shape != null) {
                if (shape.nodeType == this.mxgraph.mxConstants.NODETYPE_ELEMENT) {
                    let name = prefix + '.' + shape.getAttribute('name').replace(/ /g, '_');
                    this.mxgraph.mxStencilRegistry.addStencil(name.toLowerCase(), new this.mxgraph.mxStencil(shape));
                }
                shape = shape.nextSibling;
            }
        }
    }
}
