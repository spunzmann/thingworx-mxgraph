import * as JD from "./mtpJsonDefs"

export class MtpInfoTableParser {

    public async parse(infoTable: Object): Promise<JD.HmiDiagram> {
        try {
            console.log(`InfoTable Type: ${typeof infoTable}`);
            console.log(`InfoTable     : ${infoTable}`);
            return this.parseInfoTable(infoTable);
        } catch (e) {
            console.error(`Failed to parse InfoTable JSON  [Reason: ${e.message}, InfoTable: ${infoTable}]`)
            throw e;
        }
    }

    private parseInfoTable(infoTable: Object): JD.HmiDiagram {
        let diagram: JD.HmiDiagram = {
            pipes: [],
            elements: [],
            width: this.getNumberValue(infoTable, 'Width'),
            height: this.getNumberValue(infoTable, 'Height')
        };

        let elementNode = infoTable['Elements']
        let elements = elementNode['rows']
        let pipeNode = infoTable['Pipes']
        let pipes = pipeNode['rows']

        for (const element of elements) {
            let visualElement: JD.VisualObject = {
                id: element['ID'],
                name: element['Name'],
                type: JD.ElementType.VISUAL_ELEMENT,
                viewType: element['ViewType'],
                eClassVersion: element['EClassVersion'],
                eClassClassification: element['EClassClassification'],
                eClassIrdi: element['EClassIRDI'],
                mxGraphShape: element['MxGraphShape'],
                refId: element['RefID'],
                width: this.getNumberValue(element, "Width"),
                height: this.getNumberValue(element, "Height"),
                rotation: this.getNumberValue(element, "Rotation"),
                x: this.getNumberValue(element, "X"),
                y: this.getNumberValue(element, "Y"),
                nozzles: this.getNozzleList(element),
            };

            // find the elements that are real nozzles 
            let realNozzles = visualElement.nozzles.filter((el) => { return el.baseClass == "MTPHMISUCLib/PortObject/Nozzle" });
            if (realNozzles.length == 2) {
                // we will assume that the subelement will be positioned between this two realNozzles
                visualElement.subElement = {
                    x: Math.min(realNozzles[0].x, realNozzles[1].x),
                    y: Math.min(realNozzles[0].y, realNozzles[1].y),
                    height: realNozzles[0].y < realNozzles[1].y ? realNozzles[1].y - realNozzles[0].y : realNozzles[0].y - realNozzles[1].y,
                    width: Math.sqrt((realNozzles[0].x - realNozzles[1].x) ** 2 + (realNozzles[0].y - realNozzles[1].y) ** 2),
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

            let communicationObject = undefined;
            let communicationsNode = element['Communications']
            for (const communication of communicationsNode['rows']) {
                let interfacesNode = communication['Interfaces']

                let interfaceList: JD.CommunicationInterface[] = [];
                for (const ifcEntry of interfacesNode['rows']) {
                    interfaceList.push({
                        id: ifcEntry['ID'],
                        name: ifcEntry['Name'],
                        type: JD.ElementType.COMMUNICATION_INTERFACE,
                        access: ifcEntry['Access'],
                        identifier: ifcEntry['Identifier'],
                        namespace: ifcEntry['Namespace'],
                        endpoint: ifcEntry['Endpoint'],
                    })
                }

                communicationObject = {
                    id: communication['ID'],
                    name: communication['Name'],
                    type: JD.ElementType.COMMUNICATION_OBJECT,
                    description: communication['Description'],
                    interfaces: interfaceList,
                }
            }

            if (communicationObject) {
                diagram.elements.push({ communication: communicationObject, obj: visualElement });
            } else {
                diagram.elements.push({ obj: visualElement });
            }
        }

        for (const pipe of pipes) {
            let visualElement: JD.PipeDefinition = <JD.PipeDefinition>{
                id: pipe['ID'],
                name: pipe['Name'],
                type: JD.ElementType.PIPE,
                nozzles: this.getNozzleList(pipe),
            };
            // get the parsed path
            let parsedPath = this.parseEdgePath(pipe['EdgePath']);
            visualElement.waypoints = parsedPath.waypoints;

            // check to see if the the source and target points form the path are equal to a nozzle
            for (const nozzle of visualElement.nozzles) {
                if (parsedPath.source.equals(nozzle)) {
                    visualElement.source = nozzle;
                }
                if (parsedPath.target.equals(nozzle)) {
                    visualElement.target = nozzle;
                }
            }
            // check if the soruce and target were assigned
            if (!visualElement.source) {
                visualElement.source = parsedPath.source;
            }
            if (!visualElement.target) {
                visualElement.target = parsedPath.target;
            }
            
            diagram.pipes.push(visualElement);
        }
        return diagram;
    }

    private getNozzleList(element: Object): JD.Nozzle[] {
        let nozzles: JD.Nozzle[] = [];

        let connectionsNode = element['Connections']
        let connections = connectionsNode['rows']
        for (const connection of connections) {
            nozzles.push({
                id: connection['ID'],
                name: connection['Name'],
                x: this.getNumberValue(connection, "X"),
                y: this.getNumberValue(connection, "Y"),
                externalConnectorId: connection['ExternalConnectorId'],
                baseClass: connection['BaseClass'],
                type: JD.ElementType.NOZZLE
            })
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

    private getNumberValue(object: Object, name: string): number {
        let value = object[name];
        let numberValue = parseFloat(value);
        if (!isNaN(numberValue)) {
            return numberValue
        }
    }
}