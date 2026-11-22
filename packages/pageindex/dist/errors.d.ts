export declare class PageIndexError extends Error {
    constructor(message: string);
}
/** Thrown when a node_id is queried but does not exist in the database/tree. */
export declare class NodeNotFoundError extends PageIndexError {
    constructor(node_id: string);
}
/** Thrown when the search() query string is invalid (empty, too long, etc.). */
export declare class InvalidQueryError extends PageIndexError {
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map