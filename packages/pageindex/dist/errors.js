"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidQueryError = exports.NodeNotFoundError = exports.PageIndexError = void 0;
class PageIndexError extends Error {
    constructor(message) {
        super(message);
        this.name = "PageIndexError";
    }
}
exports.PageIndexError = PageIndexError;
/** Thrown when a node_id is queried but does not exist in the database/tree. */
class NodeNotFoundError extends PageIndexError {
    constructor(node_id) {
        super(`PageIndex node not found: "${node_id}"`);
        this.name = "NodeNotFoundError";
    }
}
exports.NodeNotFoundError = NodeNotFoundError;
/** Thrown when the search() query string is invalid (empty, too long, etc.). */
class InvalidQueryError extends PageIndexError {
    constructor(message = "Invalid search query") {
        super(message);
        this.name = "InvalidQueryError";
    }
}
exports.InvalidQueryError = InvalidQueryError;
//# sourceMappingURL=errors.js.map