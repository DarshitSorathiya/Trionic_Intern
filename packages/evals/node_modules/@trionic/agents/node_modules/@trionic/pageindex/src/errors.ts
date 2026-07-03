export class PageIndexError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PageIndexError";
  }
}

/** Thrown when a node_id is queried but does not exist in the database/tree. */
export class NodeNotFoundError extends PageIndexError {
  constructor(node_id: string) {
    super(`PageIndex node not found: "${node_id}"`);
    this.name = "NodeNotFoundError";
  }
}

/** Thrown when the search() query string is invalid (empty, too long, etc.). */
export class InvalidQueryError extends PageIndexError {
  constructor(message: string = "Invalid search query") {
    super(message);
    this.name = "InvalidQueryError";
  }
}
