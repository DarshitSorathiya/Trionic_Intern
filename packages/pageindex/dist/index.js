"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageIndex = exports.getPageIndex = exports.get_text = exports.descend = exports.search = void 0;
var query_js_1 = require("./query.js");
Object.defineProperty(exports, "search", { enumerable: true, get: function () { return query_js_1.search; } });
Object.defineProperty(exports, "descend", { enumerable: true, get: function () { return query_js_1.descend; } });
Object.defineProperty(exports, "get_text", { enumerable: true, get: function () { return query_js_1.get_text; } });
__exportStar(require("./errors.js"), exports);
var agnoTool_js_1 = require("./agnoTool.js");
Object.defineProperty(exports, "getPageIndex", { enumerable: true, get: function () { return agnoTool_js_1.getPageIndex; } });
Object.defineProperty(exports, "PageIndex", { enumerable: true, get: function () { return agnoTool_js_1.PageIndex; } });
//# sourceMappingURL=index.js.map