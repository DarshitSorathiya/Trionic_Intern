export {
	search,
	descend,
	get_text,
	getPageIndexActScope,
	getPageIndexActScopeFromNodePrefix,
	PAGEINDEX_ACT_SCOPES,
} from "./query.js";
export type { NodeLevel, PageIndexNode, PageIndexActScope, SearchScope } from "./query.js";
export * from "./errors.js";
export { getPageIndex, PageIndex } from "./agnoTool.js";
export type { SearchResult as ToolSearchResult, SearchResult as AgnoSearchResult } from "./agnoTool.js";
export type { PageIndexNodeId, SnapshotId } from "@trionic/shared";
