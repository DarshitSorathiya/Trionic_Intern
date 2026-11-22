import { getPageIndex } from "@trionic/pageindex";
const pageindex = getPageIndex();
export async function citationValidity(fixture) {
    const citeMarkers = fixture.draft_output.cite_markers;
    const invalidCitations = [];
    for (const marker of citeMarkers) {
        const result = await pageindex.get_text({ node_id: marker.node_id });
        if (!result) {
            invalidCitations.push(marker.node_id);
        }
    }
    const totalCitations = citeMarkers.length;
    const validCitations = totalCitations - invalidCitations.length;
    const citationValidityRate = totalCitations === 0 ? 0 : (validCitations / totalCitations) * 100;
    return {
        metric: "citation_validity",
        total_citations: totalCitations,
        valid_citations: validCitations,
        invalid_citations: invalidCitations,
        citation_validity_rate: citationValidityRate,
        eval_metric: {
            name: "citation_validity_rate",
            value: citationValidityRate,
            unit: "percent",
        },
        status: citationValidityRate === 100 ? "pass" : "fail",
    };
}
