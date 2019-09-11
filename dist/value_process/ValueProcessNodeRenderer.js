var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * An abstract renderer for any given node in the value process diagram
 */
var NodeRenderer = /** @class */ (function () {
    function NodeRenderer(parent, value, graph) {
        this.parent = parent;
        this.value = value;
        this.graph = graph;
    }
    /**
     * render: Renders the current node
     */
    NodeRenderer.prototype.render = function () {
    };
    return NodeRenderer;
}());
/**
 * Renderer for links in the diagram
 */
var LinkRenderer = /** @class */ (function (_super) {
    __extends(LinkRenderer, _super);
    function LinkRenderer(parent, value, graph, source, target) {
        var _this = _super.call(this, parent, value, graph) || this;
        _this.source = source;
        _this.target = target;
        return _this;
    }
    return LinkRenderer;
}(NodeRenderer));
/**
 * A renderer that takes care of the entire value process diagram
 * It firstly renders the suppliers, then the logistic centers, and finally the factory
 */
var ValueProcessDiagramRenderer = /** @class */ (function (_super) {
    __extends(ValueProcessDiagramRenderer, _super);
    function ValueProcessDiagramRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * render: Renders the entire value process diagram
    */
    ValueProcessDiagramRenderer.prototype.render = function () {
        new AllSuppliersNodeRenderer(this.parent, this.value.suppliers, this.graph).render();
        new AllLogisticCentersNodeRenderer(this.parent, this.value.logisticsCenters, this.graph).render();
        new FactoryNodeRenderer(this.parent, this.value.factory, this.graph).render();
        // now add the edges
        new AllLinksRenderer(this.parent, this.value.transportLinks, this.graph).render();
    };
    return ValueProcessDiagramRenderer;
}(NodeRenderer));
export { ValueProcessDiagramRenderer };
/**
 * Handles rendering all of the links in the diagram
 */
var AllLinksRenderer = /** @class */ (function (_super) {
    __extends(AllLinksRenderer, _super);
    function AllLinksRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * render: Renders all of the links in the diagram
     */
    AllLinksRenderer.prototype.render = function () {
        for (var i = 0; i < this.value.length; i++) {
            var edge = this.value[i];
            var source = this.graph.getModel().getCell(edge.fromId);
            var target = this.graph.getModel().getCell(edge.toId);
            if (edge.type == "truck") {
                new TruckLinkRender(this.parent, edge, this.graph, source, target).render();
            }
        }
    };
    return AllLinksRenderer;
}(NodeRenderer));
var TruckLinkRender = /** @class */ (function (_super) {
    __extends(TruckLinkRender, _super);
    function TruckLinkRender() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
      * render: Renders the truck link
      */
    TruckLinkRender.prototype.render = function () {
        this.graph.insertEdge(this.parent, null, this.value, this.source, this.target);
    };
    return TruckLinkRender;
}(LinkRenderer));
/**
 * Handles rendering a given factory
 */
var FactoryNodeRenderer = /** @class */ (function (_super) {
    __extends(FactoryNodeRenderer, _super);
    function FactoryNodeRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * render: Renders the factory and the halls in it
     */
    FactoryNodeRenderer.prototype.render = function () {
        var factoryNode = this.graph.insertVertex(this.parent, this.value.id, this.value, 0, 0, 1800, 1800, 'factory');
        for (var i = 0; i < this.value.halls.length; i++) {
            var factoryHall = this.value.halls[i];
            new FactoryHallNodeRenderer(factoryNode, factoryHall, this.graph).render();
        }
    };
    return FactoryNodeRenderer;
}(NodeRenderer));
/**
 * Handles rendering a given factory hall
 */
var FactoryHallNodeRenderer = /** @class */ (function (_super) {
    __extends(FactoryHallNodeRenderer, _super);
    function FactoryHallNodeRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * render: Renders the factory and the halls in it
     */
    FactoryHallNodeRenderer.prototype.render = function () {
        var hallNode = this.graph.insertVertex(this.parent, null, this.value, 0, 0, 1800, 1800, 'supplier');
        var inventoryNode = this.graph.insertVertex(hallNode, null, null, 0, 0, 0, 0, 'inventoryContainer');
        // now render all the inventories
        for (var i = 0; i < this.value.inventories.length; i++) {
            var inventory = this.value.inventories[i];
            new InventoryNodeRenderer(inventoryNode, inventory, this.graph).render();
            inventory.info.push({ key: 'title', value: inventory.name });
            new DataBoxRenderer(inventoryNode, inventory.info, this.graph).render();
        }
        // now iterate through the capabilities and add them 
        for (var j = 0; j < this.value.capabilities.length; j++) {
            var capability = this.value.capabilities[j];
            var renderer = CapabilityFactory.getCapabilityRenderer(capability.type);
            new renderer(hallNode, capability.info ? capability.info : capability, this.graph).render();
        }
    };
    return FactoryHallNodeRenderer;
}(NodeRenderer));
/**
 * Handles rendering all the logistic centers in a given diagram
 */
var AllLogisticCentersNodeRenderer = /** @class */ (function (_super) {
    __extends(AllLogisticCentersNodeRenderer, _super);
    function AllLogisticCentersNodeRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * render: Renders the an all supplier node
     */
    AllLogisticCentersNodeRenderer.prototype.render = function () {
        var logisticCentersVertex = this.graph.insertVertex(this.parent, null, null, 0, 0, 1800, 1800, 'suppliers');
        for (var i = 0; i < this.value.length; i++) {
            var logisticCenter = this.value[i];
            new LogisticCenterNodeRenderer(logisticCentersVertex, logisticCenter, this.graph).render();
        }
    };
    return AllLogisticCentersNodeRenderer;
}(NodeRenderer));
/**
 * Handles rendering all the logistic centers in a given diagram
 */
var LogisticCenterNodeRenderer = /** @class */ (function (_super) {
    __extends(LogisticCenterNodeRenderer, _super);
    function LogisticCenterNodeRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * render: Renders the an all supplier node
     */
    LogisticCenterNodeRenderer.prototype.render = function () {
        var logisticCenter = this.graph.insertVertex(this.parent, this.value.id, this.value, 0, 0, 1800, 1800, 'supplier');
        // now iterate through the capabilities and add them 
        for (var j = 0; j < this.value.capabilities.length; j++) {
            var capability = this.value.capabilities[j];
            var renderer = CapabilityFactory.getCapabilityRenderer(capability.type);
            new renderer(logisticCenter, capability.info ? capability.info : capability, this.graph).render();
        }
    };
    return LogisticCenterNodeRenderer;
}(NodeRenderer));
/**
 * Handles rendering of forklift
 */
var ForkliftNodeRenderer = /** @class */ (function (_super) {
    __extends(ForkliftNodeRenderer, _super);
    function ForkliftNodeRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * render: Renders the an all supplier node
     */
    ForkliftNodeRenderer.prototype.render = function () {
        this.graph.insertVertex(this.parent, null, { tooltip: 'Forklift' }, 0, 0, 200, 20, "capability;shape=mxgraph.lean_mapping.move_by_forklift");
    };
    return ForkliftNodeRenderer;
}(NodeRenderer));
/**
 * Handles rendering of X type cells
 */
var CapabilityXNodeRenderer = /** @class */ (function (_super) {
    __extends(CapabilityXNodeRenderer, _super);
    function CapabilityXNodeRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * render: Renders the an all supplier node
     */
    CapabilityXNodeRenderer.prototype.render = function () {
        this.graph.insertVertex(this.parent, null, 'X', 0, 0, 200, 20, "shape=rectangle;fontSize=18;strokeColor=black;strokeWidth=1;fillColor=transparent;spacing=6");
    };
    return CapabilityXNodeRenderer;
}(NodeRenderer));
/**
 * Handles rendering of generic text type cells
 */
var TextNodeRenderer = /** @class */ (function (_super) {
    __extends(TextNodeRenderer, _super);
    function TextNodeRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * render: Renders the an all supplier node
     */
    TextNodeRenderer.prototype.render = function () {
        this.graph.insertVertex(this.parent, null, this.value.value, 0, 0, 200, 20, "fontSize=12;spacing=6;whiteSpace=wrap");
    };
    return TextNodeRenderer;
}(NodeRenderer));
/**
 * Handles rendering of a lift
 */
var LiftNodeRenderer = /** @class */ (function (_super) {
    __extends(LiftNodeRenderer, _super);
    function LiftNodeRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * render: Renders the an all supplier node
     */
    LiftNodeRenderer.prototype.render = function () {
        this.graph.insertVertex(this.parent, null, { tooltip: 'Lift' }, 0, 0, 200, 20, "capability;shape=mxgraph.lean_mapping.lift");
    };
    return LiftNodeRenderer;
}(NodeRenderer));
/**
 * Handles rendering of a inventoryBox
 */
var InventoryNodeRenderer = /** @class */ (function (_super) {
    __extends(InventoryNodeRenderer, _super);
    function InventoryNodeRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * render: Renders the an all supplier node
     */
    InventoryNodeRenderer.prototype.render = function () {
        this.graph.insertVertex(this.parent, null, { tooltip: 'Inventory' }, 0, 0, 200, 20, "capability;shape=mxgraph.lean_mapping.inventory_box");
    };
    return InventoryNodeRenderer;
}(NodeRenderer));
/**
 * Handles rendering of an operator
 */
var OperatorNodeRenderer = /** @class */ (function (_super) {
    __extends(OperatorNodeRenderer, _super);
    function OperatorNodeRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * render: Renders the operator note using a custom shape
     */
    OperatorNodeRenderer.prototype.render = function () {
        this.graph.insertVertex(this.parent, null, { tooltip: 'Operator' }, 0, 0, 200, 20, "capability;shape=mxgraph.lean_mapping.operator");
    };
    return OperatorNodeRenderer;
}(NodeRenderer));
/**
 * Handles rendering of a process
 */
var ProcessNodeRenderer = /** @class */ (function (_super) {
    __extends(ProcessNodeRenderer, _super);
    function ProcessNodeRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * render: Renders the an all supplier node
     */
    ProcessNodeRenderer.prototype.render = function () {
        var processNode = this.graph.insertVertex(this.parent, null, this.value, 0, 0, 200, 20, "process");
        // now iterate through the capabilities and add them 
        for (var j = 0; j < this.value.capabilities.length; j++) {
            var capability = this.value.capabilities[j];
            var renderer = CapabilityFactory.getCapabilityRenderer(capability.type);
            new renderer(processNode, capability.info ? capability.info : capability, this.graph).render();
        }
    };
    return ProcessNodeRenderer;
}(NodeRenderer));
/**
 * Handles rendering all the suppliers in a given diagram
 */
var AllSuppliersNodeRenderer = /** @class */ (function (_super) {
    __extends(AllSuppliersNodeRenderer, _super);
    function AllSuppliersNodeRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * render: Renders the an all supplier node
     */
    AllSuppliersNodeRenderer.prototype.render = function () {
        var suppliersParent = this.graph.insertVertex(this.parent, null, null, 0, 0, 1800, 1800, 'suppliers');
        for (var i = 0; i < this.value.length; i++) {
            var supplier = this.value[i];
            new SupplierNodeRenderer(suppliersParent, supplier, this.graph).render();
        }
    };
    return AllSuppliersNodeRenderer;
}(NodeRenderer));
/**
 * Renders a given suppliers. First renders the supplier vertex and
 * then the parts inside of it
 */
var SupplierNodeRenderer = /** @class */ (function (_super) {
    __extends(SupplierNodeRenderer, _super);
    function SupplierNodeRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * render: Renders the an all supplier node
     */
    SupplierNodeRenderer.prototype.render = function () {
        var supplierNode = this.graph.insertVertex(this.parent, this.value.id, this.value, 0, 0, 400, 300, 'supplier');
        for (var j = 0; j < this.value.parts.length; j++) {
            var part = this.value.parts[j];
            new DataBoxRenderer(supplierNode, part, this.graph).render();
        }
    };
    return SupplierNodeRenderer;
}(NodeRenderer));
/**
 * Handles a "part" in the value process diagram.
 * This part is rendered as a DataBox
 */
var DataBoxRenderer = /** @class */ (function (_super) {
    __extends(DataBoxRenderer, _super);
    function DataBoxRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * render: Renders the an all supplier node
     */
    DataBoxRenderer.prototype.render = function () {
        var value = {
            objectLink: undefined,
            title: undefined,
            id: undefined
        };
        for (var _i = 0, _a = this.value; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item.key == 'title') {
                value.title = item.value;
            }
            else if (item.key == 'objectLink') {
                value.objectLink = item.value;
            }
            else if (item.key == 'id') {
                value.id = item.value;
            }
        }
        var partNode = this.graph.insertVertex(this.parent, value.id, value, 0, 0, 10, 300, 'part');
        for (var _b = 0, _c = this.value; _b < _c.length; _b++) {
            var info = _c[_b];
            // and finally all of the details
            if (info.value && info.key != 'id' && info.key != 'title' && info.key != 'type' && info.key != 'objectLink') {
                new DataBoxItemRenderer(partNode, info, this.graph).render();
            }
        }
    };
    return DataBoxRenderer;
}(NodeRenderer));
var DataBoxItemRenderer = /** @class */ (function (_super) {
    __extends(DataBoxItemRenderer, _super);
    function DataBoxItemRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * render: Renders the an all supplier node
     */
    DataBoxItemRenderer.prototype.render = function () {
        this.graph.insertVertex(this.parent, null, this.value, 0, 0, 200, 20, "partDetails");
    };
    return DataBoxItemRenderer;
}(NodeRenderer));
var CapabilityFactory = /** @class */ (function () {
    function CapabilityFactory() {
    }
    CapabilityFactory.getCapabilityRenderer = function (capability) {
        if (this.mapping[capability]) {
            return this.mapping[capability];
        }
        else {
            return this.mapping["default"];
        }
    };
    CapabilityFactory.mapping = {
        "forklift": ForkliftNodeRenderer,
        "databox": DataBoxRenderer,
        "process": ProcessNodeRenderer,
        "operator": OperatorNodeRenderer,
        "X": CapabilityXNodeRenderer,
        "lift": LiftNodeRenderer,
        "inventory": InventoryNodeRenderer,
        "text": TextNodeRenderer,
        "default": NodeRenderer
    };
    return CapabilityFactory;
}());
//# sourceMappingURL=ValueProcessNodeRenderer.js.map