//Added by Vladimir. Contents of mtpJsonDef.ts
var Point = /** @class */ (function () {
    function Point(xOrValue, y) {
        if (typeof xOrValue == "string") {
            var tokens = xOrValue.split(",");
            if (tokens.length < 2) {
                throw "We need two points to create a mxPoint";
            }
            this.x = parseFloat(tokens[0]);
            this.y = parseFloat(tokens[1]);
        }
        else {
            this.x = xOrValue;
            this.y = y;
        }
    }
    Point.prototype.equals = function (otherPoint) {
        return this.x == otherPoint.x && this.y == otherPoint.y;
    };
    return Point;
}());
export { Point };
export function isNozzle(object) {
    return 'type' in object && object.type == ElementType.NOZZLE;
}
export var ElementType;
(function (ElementType) {
    ElementType["PIPE"] = "Pipe";
    ElementType["NOZZLE"] = "Nozzle";
    ElementType["VISUAL_ELEMENT"] = "VisualElement";
    ElementType["COMMUNICATION_INTERFACE"] = "CommunicationInterface";
    ElementType["COMMUNICATION_OBJECT"] = "CommunicationObject";
})(ElementType || (ElementType = {}));
window["Point"] = Point;
window["ElementType"] = ElementType;
window["isNozzle"] = isNozzle;
//Finish section mtpJsonDef.ts
//# sourceMappingURL=mtpJsonDefs.js.map