 
 //Added by Vladimir. Contents of mtpJsonDef.ts
 
 
  export interface IPoint {
        x: number;
        y: number;
    }
    
   export class Point implements IPoint {
        x: number;
        y: number;
    
        constructor(x: number, y: number) 
        constructor(value: string)
        constructor(xOrValue: number | string, y?: number) {
            if(typeof xOrValue == "string") {
                const tokens = xOrValue.split(",");
                if (tokens.length < 2) {
                    throw "We need two points to create a mxPoint"
                }
                this.x = parseFloat(tokens[0])
                this.y = parseFloat(tokens[1])
            } else {
                this.x = xOrValue;
                this.y = y as number;
            }
        }
    
        equals(otherPoint: IPoint) {
            return this.x == otherPoint.x && this.y == otherPoint.y;
        }
    }
    
   export function isNozzle(object: IPoint | Nozzle): object is Nozzle {
        return 'type' in object && object.type == ElementType.NOZZLE;
    }
    
   export interface Shape extends IPoint {
        width: number;
        height: number;
        rotation: number;
    }
    
    export enum ElementType {
        PIPE = "Pipe", 
        NOZZLE = "Nozzle",
        VISUAL_ELEMENT = "VisualElement", 
        COMMUNICATION_INTERFACE = "CommunicationInterface", 
        COMMUNICATION_OBJECT = "CommunicationObject"
    }
    
   export interface GenericMptElement {
        id: string;
        name: string;
        type: ElementType;
    }
    
    export interface PositionableElement extends IPoint {
        // empty
    }
    
    export interface Nozzle extends GenericMptElement, PositionableElement {
        externalConnectorId: string;
        baseClass: string;
    }
    
    export interface VisualObject extends Shape, GenericMptElement {
        viewType: string;
        eClassVersion: string;
        eClassClassification: string;
        eClassIrdi: string;
        refId: string;
        nozzles: Nozzle[];
        subElement?: Shape;
    }
    
   export interface PipeDefinition extends GenericMptElement {
        source: IPoint | Nozzle;
        target: IPoint | Nozzle;
        waypoints: IPoint[];
        nozzles: Nozzle[];
    }
    
   export interface CommunicationInterface extends GenericMptElement {
        identifier: string;
        namespace: string;
        access: string;
        endpoint: string;
    }
    
   export interface CommunicationObject extends GenericMptElement {
        description: string;
        interfaces: CommunicationInterface[];
    }
    
    export interface InteractibleElement {
        obj: VisualObject;
        communication?: CommunicationObject;
    }
    
   export interface HmiDiagram {
        width: number;
        height: number;
        elements: InteractibleElement[];
        pipes: PipeDefinition[];
    }
    
  export  interface Window {
        Point: typeof Point
        ElementType: typeof ElementType,
        isNozzle: typeof isNozzle
    }
    window["Point"] = Point;
    window["ElementType"] = ElementType;
    window["isNozzle"] = isNozzle;
    //Finish section mtpJsonDef.ts