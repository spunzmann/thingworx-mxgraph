
import * as JD from "./mtpJsonDefs"

/**
 * @deprecated MTP specific logic has been outsourced to ThingWorx, will be removed soon
 */
export class MtpFileParser {

    public async loadFile(filePath: string): Promise<JD.HmiDiagram> {
        try {
            const response = await fetch(filePath);
            const responseText = await response.text();
            const xmlData = new DOMParser().parseFromString(responseText, "text/xml");
            return this.parseMtpXml(xmlData);
        } catch (e) {
            console.error(`Failed to load MTP [Reason: ${e.message}, FilePath: ${filePath}]`)
            throw e;
        }
    }

    private parseMtpXml(file: Document): JD.HmiDiagram {
        let diagram: JD.HmiDiagram = {
            pipes: [],
            elements: [],
            width: 0,
            height: 0
        };

        // find a referece to the diagram object
        //const hmiDiagramXml = file.querySelector('InstanceHierarchy[Name="HMI"] InternalElement[Name="Kat_Formulierung"]');
        //We consider the first InternalElement element from the HMI node as the HMI diagram in order not to add a widget property in the Composer
        const hmiDiagramXml = file.querySelector('InstanceHierarchy[Name="HMI"] InternalElement');
        if (!hmiDiagramXml) {
            throw "No hmi diagram found in given file"
        }
        diagram.width = this.getAttributeTagValue(hmiDiagramXml, "Width", true);
        diagram.height = this.getAttributeTagValue(hmiDiagramXml, "Height", true);

        // iterate through the internal elements of the diagram and add them to the diagram
        for (let i = 0; i < hmiDiagramXml.childElementCount; i++) {
            const element = hmiDiagramXml.children[i] as Element;
            if (element.nodeName == "InternalElement") {
                this.parseHmiInternalElement(element, diagram, file);
            }
        }

        return diagram;
    }

    private parseHmiInternalElement(element: Element, diagram: JD.HmiDiagram, file: Document) {
        // if there is a attribute with an edge path, assume it's a line
        if (this.getAttributeTagValue(element, "Edgepath", false)) {
            this.parseHmiPipe(element, diagram);
        } else if (this.getAttributeTagValue(element, "eClassClassificationClass", false)) {
            this.parseDiagramElement(element, diagram, file);
        }
    }

    private parseDiagramElement(element: Element, diagram: JD.HmiDiagram, file: Document) {
        let nozzles = this.getNozzleList(element);
        let visualElement: JD.VisualObject = {
            viewType: this.getAttributeTagValue(element, "ViewType", false),
            eClassVersion: this.getAttributeTagValue(element, "eClassVersion", false),
            //eClassClassification: this.getAttributeTagValue(element, "eClassClassificationClass", false),
            //we enhance the eClassClassification to contain also the ViewType, in case the eClassClassification does not contain a valid eclass (meaning it is equal to 0)
            //this eClassClassification is used in other widget part to map the element to a specific icon
            eClassClassification: this.getAttributeTagValue(element, "eClassClassificationClass", false)!="0"?this.getAttributeTagValue(element, "eClassClassificationClass", false):this.getAttributeTagValue(element, "ViewType", false),
            eClassIrdi: this.getAttributeTagValue(element, "eClassIRDI", false),
            refId: this.getAttributeTagValue(element, "RefID", false),
            mxGraphShape: "",
            id: element.getAttribute("ID")!,
            name: element.getAttribute("Name")!,
            width: this.getAttributeTagValue(element, "Width", true),
            height: this.getAttributeTagValue(element, "Height", true),
            rotation: this.getAttributeTagValue(element, "Rotation", true),
            x: this.getAttributeTagValue(element, "X", true),
            y: this.getAttributeTagValue(element, "Y", true),
            nozzles: nozzles,
            type: JD.ElementType.VISUAL_ELEMENT
        };
        // find the elements that are real nozzles 
        let realNozzles = nozzles.filter((el) => { return el.baseClass == "MTPHMISUCLib/PortObject/Nozzle" });
        if (realNozzles.length == 2) {
            // we will assume that the subelement will be positioned between this two realNozzles
            visualElement.subElement = {
                x: Math.min(realNozzles[0].x, realNozzles[1].x),
                y: Math.min(realNozzles[0].y, realNozzles[1].y),
                height: realNozzles[0].y < realNozzles[1].y ? realNozzles[1].y - realNozzles[0].y : realNozzles[0].y - realNozzles[1].y,
                width: Math.sqrt((realNozzles[0].x - realNozzles[1].x) ** 2 + (realNozzles[0].y - realNozzles[1].y) ** 2),
                rotation: visualElement.rotation            // inherit the rotation from the parent
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
        let communicationElementAttr = file.evaluate(`//InstanceHierarchy[@Name="ModuleTypePackage"]//InternalElement[@Name="CommunicationSet"]` +
            `/InternalElement[@Name="InstanceList"]//Attribute[@Name="RefID"][Value="${visualElement.refId}"]`,
            file, null, XPathResult.ANY_TYPE, null).iterateNext();
        let communicationElement = communicationElementAttr ? communicationElementAttr.parentElement : undefined;
        let communicationObject = undefined;
        if (communicationElement != null) {
            let communicationDescription = communicationElement.querySelector("Description")!.textContent!;
            let interfaceList: JD.CommunicationInterface[] = [];
            // interate through the attributes and try to get each communication element
            for (let i = 0; i < communicationElement.childElementCount; i++) {
                const attrElement = communicationElement.children[i] as Element;
                if (attrElement.nodeName == "Attribute" && attrElement.getAttribute("Node") != "RefID") {
                    let attrValue = attrElement.getElementsByTagName("Value")[0].textContent;
                    // search for this attribute in the communication lib
                    let sourceCommunicationElement = file.querySelector(`InstanceHierarchy[Name="ModuleTypePackage"] InternalElement[Name="CommunicationSet"] ` +
                        `InternalElement[Name="SourceList"]  ExternalInterface[ID="${attrValue}"]`);
                    if (sourceCommunicationElement) {
                        interfaceList.push({
                            access: this.getAttributeTagValue(sourceCommunicationElement, "Access", false),
                            identifier: this.getAttributeTagValue(sourceCommunicationElement, "Identifier", false),
                            namespace: this.getAttributeTagValue(sourceCommunicationElement, "Namespace", false),
                            type: JD.ElementType.COMMUNICATION_INTERFACE,
                            id: sourceCommunicationElement.getAttribute("ID")!,
                            name: attrElement.getAttribute("Name")!,
                            endpoint: this.getAttributeTagValue(sourceCommunicationElement.parentElement!, "Endpoint", false)
                        })
                    }
                }
            }
            communicationObject = {
                description: communicationDescription,
                interfaces: interfaceList,
                type: JD.ElementType.COMMUNICATION_OBJECT,
                id: communicationElement.getAttribute("ID")!,
                name: communicationElement.getAttribute("Name")!
            }
        }
        if (communicationObject) {
            diagram.elements.push({ communication: communicationObject, obj: visualElement });
        } else {
            diagram.elements.push({ obj: visualElement });
        }
    }

    private parseHmiPipe(element: Element, diagram: JD.HmiDiagram) {
        let pipe: JD.PipeDefinition = <JD.PipeDefinition>{
            id: element.getAttribute("ID"),
            name: element.getAttribute("Name"),
            type: JD.ElementType.PIPE
        };
        // get the parsed path
        let parsedPath = this.parseEdgePath(this.getAttributeTagValue(element, "Edgepath", false));
        // parse the nozzles
        pipe.nozzles = this.getNozzleList(element);
        // check to see if the the source and target points form the path are equal to a nozzle
        for (const nozzle of pipe.nozzles) {
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
    }

    private getNozzleList(element: Element): JD.Nozzle[] {
        let nozzles: JD.Nozzle[] = [];
        for (let j = 0; j < element.childElementCount; j++) {
            const subElement = element.children[j] as Element;
            if (subElement.nodeName == "InternalElement") {
                nozzles.push({
                    id: subElement.getAttribute("ID")!,
                    name: subElement.getAttribute("Name")!,
                    x: this.getAttributeTagValue(subElement, "X", true),
                    y: this.getAttributeTagValue(subElement, "Y", true),
                    externalConnectorId: element.querySelector('ExternalInterface[Name="Connector"]')!.getAttribute("ID")!,
                    baseClass: subElement.getAttribute("RefBaseSystemUnitPath")!,
                    type: JD.ElementType.NOZZLE
                })
            }
        }
        return nozzles;
    }


    /**
     * Computes a list of points into a start, end and intermidiate points
     */
    private parseEdgePath(edgePath: string): { source: JD.Point, target: JD.Point, waypoints: JD.Point[] } {
        let tokens = edgePath.split(";");
        return {
            source: new JD.Point(tokens[0]),
            target: new JD.Point(tokens[tokens.length - 1]),
            waypoints: tokens.slice(1, -1).map((el) => { return new JD.Point(el) })
        }
    }

    private getAttributeTagValue(parent: Element, attrName: string, asNumber: true): number;
    private getAttributeTagValue(parent: Element, attrName: string, asNumber: false): string;

    /**
     * XML parsing fucntion, helping getting the Value tag of a Attribute tag identified by the attrName
     */
    private getAttributeTagValue(parent: Element, attrName: string, asNumber: boolean): number | string | undefined | null {
        let value = parent.querySelector(`Attribute[Name="${attrName}"] > Value`);
        if (value) {
            if (asNumber && value.textContent) {
                return parseFloat(value.textContent);
            } else {
                return value.textContent;
            }
        }
    }
}