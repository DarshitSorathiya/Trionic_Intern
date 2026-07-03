import { NextResponse } from "next/server";
import { get_text } from "@trionic/pageindex";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ node_id: string[] }> }
) {
  try {
    const { node_id } = await params;
    const nodeId = node_id.join("/");

    console.log(`[Proxy API] Fetching pageindex text for: ${nodeId}`);
    const node = await get_text(nodeId);

    if (!node) {
      return NextResponse.json({ error: "node_not_found" }, { status: 404 });
    }

    return NextResponse.json(node);
  } catch (error) {
    console.error("Failed to proxy pageindex text:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
