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
import { mxgraph } from "../generic/mxGraphImport";
import { mxValueProcessLayout } from "./mxValueProcessLayout";
var mxStackLayout = mxgraph.mxStackLayout;
var LayoutFactory = /** @class */ (function () {
    function LayoutFactory() {
    }
    LayoutFactory.initialize = function (graph) {
        LayoutFactory.defaultLayout = new mxValueProcessLayout(graph, false);
        LayoutFactory.defaultLayout.resizeParent = true;
        LayoutFactory.defaultLayout.border = 1;
        LayoutFactory.defaultLayout.horizontal = true;
        LayoutFactory.defaultLayout.spacing = 50;
        LayoutFactory.defaultLayout.resizeParent = true;
        LayoutFactory.supplierLayout = new mxValueProcessLayout(graph, true);
        LayoutFactory.supplierLayout.resizeParent = true;
        LayoutFactory.supplierLayout.spacing = 20;
        LayoutFactory.supplierLayout.marginTop = 80;
        LayoutFactory.supplierLayout.marginBottom = 20;
        LayoutFactory.supplierLayout.marginLeft = 10;
        LayoutFactory.factoryLayout = new mxValueProcessLayout(graph, false);
        LayoutFactory.factoryLayout.resizeParent = true;
        LayoutFactory.factoryLayout.spacing = 20;
        LayoutFactory.factoryLayout.marginTop = 80;
        LayoutFactory.factoryLayout.marginBottom = 20;
        LayoutFactory.factoryLayout.marginLeft = 10;
        LayoutFactory.partLayout = new mxValueProcessLayout(graph, false);
        LayoutFactory.partLayout.resizeParent = true;
        LayoutFactory.partLayout.fill = true;
        LayoutFactory.partLayout.fillSpacing = 5;
        LayoutFactory.allSuppliersLayout = new mxValueProcessLayout(graph, false);
        LayoutFactory.allSuppliersLayout.resizeParent = true;
        LayoutFactory.allSuppliersLayout.spacing = 20;
        LayoutFactory.hallInventoryLayout = new mxValueProcessLayout(graph, false);
        LayoutFactory.hallInventoryLayout.resizeParent = true;
        LayoutFactory.hallInventoryLayout.spacing = 20;
        LayoutFactory.processLayout = new mxValueProcessLayout(graph, true);
        LayoutFactory.processLayout.resizeParent = true;
        LayoutFactory.processLayout.spacing = 10;
        LayoutFactory.processLayout.marginTop = 5;
        LayoutFactory.processLayout.marginBottom = 5;
        LayoutFactory.processLayout.marginLeft = 5;
    };
    return LayoutFactory;
}());
/**
 * A abstract cell renderer. This is responsible for rendering the label, and tooltip of a cell
 */
var CellRendererAbstract = /** @class */ (function () {
    function CellRendererAbstract() {
    }
    CellRendererAbstract.prototype.getRenderedLabel = function (cell) { return; };
    ;
    CellRendererAbstract.prototype.getTooltip = function (cell) { return; };
    CellRendererAbstract.prototype.isLabelClipped = function (cell) { return false; };
    CellRendererAbstract.prototype.isCellFoldable = function (cell) { return true; };
    CellRendererAbstract.prototype.getLayout = function (cell) { return LayoutFactory.defaultLayout; };
    ;
    CellRendererAbstract.prototype.isCellSelectable = function (cell) { return true; };
    CellRendererAbstract.prototype.isCellEditable = function (cell) { return false; };
    return CellRendererAbstract;
}());
var PartRenderer = /** @class */ (function (_super) {
    __extends(PartRenderer, _super);
    function PartRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Renderer of a cell that represents a part. Just return the title
     */
    PartRenderer.prototype.getRenderedLabel = function (cell) {
        if (cell.value.objectLink) {
            var link = document.createElement('a');
            link.href = cell.value.objectLink;
            link.textContent = cell.value.title;
            link.target = '_blank';
            link.style.color = 'white';
            return link.outerHTML;
        }
        else {
            return cell.value.title;
        }
    };
    ;
    /**
     * The tooltip is just the title of the part
     */
    PartRenderer.prototype.getTooltip = function (cell) {
        return cell.value.title;
    };
    PartRenderer.prototype.isLabelClipped = function (cell) { return true; };
    PartRenderer.prototype.getLayout = function (cell) { return LayoutFactory.partLayout; };
    return PartRenderer;
}(CellRendererAbstract));
/**
 * Renderer of a supplier cell
 * At the moment this is rendererd as a swimlane cell with only the title
 */
var SupplierCellRenderer = /** @class */ (function (_super) {
    __extends(SupplierCellRenderer, _super);
    function SupplierCellRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SupplierCellRenderer.prototype.getRenderedLabel = function (cell) {
        var link = document.createElement('a');
        link.href = cell.value.objectLink;
        link.textContent = cell.value.name;
        link.target = '_blank';
        return link.outerHTML;
    };
    SupplierCellRenderer.prototype.getTooltip = function (cell) {
        return cell.value.name;
    };
    SupplierCellRenderer.prototype.isLabelClipped = function (cell) { return true; };
    SupplierCellRenderer.prototype.getLayout = function (cell) { return LayoutFactory.supplierLayout; };
    return SupplierCellRenderer;
}(CellRendererAbstract));
/**
 * The default process renderer. Just returns the value of the cell
 */
var ProcessCellRenderer = /** @class */ (function (_super) {
    __extends(ProcessCellRenderer, _super);
    function ProcessCellRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ProcessCellRenderer.prototype.getRenderedLabel = function (cell) {
        return cell.value.name;
    };
    ProcessCellRenderer.prototype.getTooltip = function (cell) {
        return cell.value.name;
    };
    ProcessCellRenderer.prototype.getLayout = function (cell) { return LayoutFactory.processLayout; };
    return ProcessCellRenderer;
}(CellRendererAbstract));
/**
 * The default cell renderer. Just returns the value of the cell
 */
var DefaultVertexRenderer = /** @class */ (function (_super) {
    __extends(DefaultVertexRenderer, _super);
    function DefaultVertexRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DefaultVertexRenderer.prototype.getRenderedLabel = function (cell) {
        return cell.value;
    };
    DefaultVertexRenderer.prototype.getTooltip = function (cell) {
        return cell.value ? cell.value.tooltip : "";
    };
    DefaultVertexRenderer.prototype.isCellFoldable = function (cell) { return false; };
    return DefaultVertexRenderer;
}(CellRendererAbstract));
/**
 * The default edge renderer.
 */
var DefaultEdgeRenderer = /** @class */ (function (_super) {
    __extends(DefaultEdgeRenderer, _super);
    function DefaultEdgeRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DefaultEdgeRenderer.prototype.getRenderedLabel = function (cell) {
        var content = document.createElement('div');
        content.style.display = 'flex';
        content.style.flexDirection = 'column';
        content.style.alignItems = 'center';
        var link = document.createElement('a');
        link.href = cell.value ? cell.value.objectLink : "";
        link.textContent = cell.value ? cell.value.label : "";
        link.target = '_blank';
        content.appendChild(link);
        var image = document.createElement('img');
        image.src = require('./resources/truckIcon.png');
        image.style.width = '52px';
        image.style.height = '25px';
        content.appendChild(image);
        if (cell.value && cell.value.info) {
            for (var key in cell.value.info) {
                if (cell.value.info.hasOwnProperty(key)) {
                    var element = cell.value.info[key];
                    var label = document.createElement("span");
                    label.textContent = key + ": " + cell.value.info[key];
                    content.appendChild(label);
                }
            }
        }
        return content.outerHTML;
    };
    DefaultEdgeRenderer.prototype.getTooltip = function (cell) {
        return "";
    };
    DefaultEdgeRenderer.prototype.isCellFoldable = function (cell) { return false; };
    return DefaultEdgeRenderer;
}(CellRendererAbstract));
var AllSupplierCell = /** @class */ (function (_super) {
    __extends(AllSupplierCell, _super);
    function AllSupplierCell() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AllSupplierCell.prototype.getRenderedLabel = function (cell) { return; };
    ;
    AllSupplierCell.prototype.getTooltip = function (cell) { return; };
    AllSupplierCell.prototype.isCellFoldable = function (cell) { return false; };
    AllSupplierCell.prototype.getLayout = function (cell) { return LayoutFactory.allSuppliersLayout; };
    AllSupplierCell.prototype.isCellSelectable = function (cell) { return false; };
    return AllSupplierCell;
}(CellRendererAbstract));
var PartDetailsCell = /** @class */ (function (_super) {
    __extends(PartDetailsCell, _super);
    function PartDetailsCell() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PartDetailsCell.prototype.getRenderedLabel = function (cell) {
        var container = document.createElement('div');
        var keyElement = document.createElement('strong');
        keyElement.textContent = cell.value.key + ': ';
        container.appendChild(keyElement);
        var valueElement = document.createElement('span');
        valueElement.textContent = cell.value.value;
        container.appendChild(valueElement);
        return container.outerHTML;
    };
    ;
    PartDetailsCell.prototype.getTooltip = function (cell) { return cell.value.key + ": " + cell.value.value; };
    PartDetailsCell.prototype.isCellFoldable = function (cell) { return false; };
    PartDetailsCell.prototype.isCellSelectable = function (cell) { return false; };
    PartDetailsCell.prototype.isCellEditable = function (cell) {
        return cell.value.isEditable ? true : false;
    };
    return PartDetailsCell;
}(CellRendererAbstract));
var HallInventoryCell = /** @class */ (function (_super) {
    __extends(HallInventoryCell, _super);
    function HallInventoryCell() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HallInventoryCell.prototype.getRenderedLabel = function (cell) { return undefined; };
    ;
    HallInventoryCell.prototype.getTooltip = function (cell) { return cell.value; };
    HallInventoryCell.prototype.isCellFoldable = function (cell) { return false; };
    HallInventoryCell.prototype.getLayout = function (cell) { return LayoutFactory.hallInventoryLayout; };
    HallInventoryCell.prototype.isCellSelectable = function (cell) { return false; };
    return HallInventoryCell;
}(CellRendererAbstract));
var FactoryCellRenderer = /** @class */ (function (_super) {
    __extends(FactoryCellRenderer, _super);
    function FactoryCellRenderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FactoryCellRenderer.prototype.getRenderedLabel = function (cell) { return cell.value.name; };
    ;
    FactoryCellRenderer.prototype.getTooltip = function (cell) { return cell.value.name; };
    FactoryCellRenderer.prototype.getLayout = function (cell) { return LayoutFactory.factoryLayout; };
    FactoryCellRenderer.prototype.isCellSelectable = function (cell) { return false; };
    return FactoryCellRenderer;
}(CellRendererAbstract));
/**
 * Factory method for getting renderer methods for cell
 */
var GraphCellRenderer = /** @class */ (function () {
    function GraphCellRenderer(graph) {
        var _this = this;
        this.mapping = {
            "part": PartRenderer,
            "supplier": SupplierCellRenderer,
            "defaultVertex": DefaultVertexRenderer,
            "defaultEdge": DefaultEdgeRenderer,
            "suppliers": AllSupplierCell,
            "partDetails": PartDetailsCell,
            "inventoryContainer": HallInventoryCell,
            "factory": FactoryCellRenderer,
            "process": ProcessCellRenderer
        };
        this.getCellLabel = function (cell) {
            var cellRenderer = _this.getRendererForCell(cell);
            return new cellRenderer().getRenderedLabel(cell);
        };
        this.getCellTooltip = function (cell) {
            var cellRenderer = _this.getRendererForCell(cell);
            return new cellRenderer().getTooltip(cell);
        };
        this.isLabelClipped = function (cell) {
            var cellRenderer = _this.getRendererForCell(cell);
            return new cellRenderer().isLabelClipped(cell);
        };
        this.isCellFoldable = function (cell) {
            var cellRenderer = _this.getRendererForCell(cell);
            return new cellRenderer().isCellFoldable(cell);
        };
        this.getLayout = function (cell) {
            var cellRenderer = _this.getRendererForCell(cell);
            return new cellRenderer().getLayout(cell);
        };
        this.isCellSelectable = function (cell) {
            var cellRenderer = _this.getRendererForCell(cell);
            return new cellRenderer().isCellSelectable(cell);
        };
        this.isCellEditable = function (cell) {
            var cellRenderer = _this.getRendererForCell(cell);
            return new cellRenderer().isCellEditable(cell);
        };
        LayoutFactory.initialize(graph);
    }
    GraphCellRenderer.prototype.getRendererForCell = function (cell) {
        if (cell && this.mapping[cell.style]) {
            return this.mapping[cell.style];
        }
        else {
            if (cell.isVertex()) {
                return this.mapping["defaultVertex"];
            }
            else {
                return this.mapping["defaultEdge"];
            }
        }
    };
    return GraphCellRenderer;
}());
export { GraphCellRenderer };
//# sourceMappingURL=CellFactory.js.map