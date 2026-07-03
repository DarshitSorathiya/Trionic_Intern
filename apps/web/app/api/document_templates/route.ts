import { NextResponse } from "next/server";
import { getTemplate } from "@/lib/document-templates";
import type { DocumentType } from "@trionic/shared";

const ALLOWED_DOC_TYPES: DocumentType[] = [
  "rti_application",
  "legal_notice",
  "nda",
  "consumer_complaint",
  "cheque_bounce_notice",
  "other",
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const typeParam = searchParams.get("type");

  if (!typeParam) {
    return NextResponse.json(
      { error: "bad_request", message: "Missing required query param: type" },
      { status: 400 },
    );
  }

  const docType = typeParam as DocumentType;
  if (!ALLOWED_DOC_TYPES.includes(docType)) {
    return NextResponse.json(
      {
        error: "bad_request",
        message: `Invalid type. Allowed: ${ALLOWED_DOC_TYPES.join(", ")}`,
      },
      { status: 400 },
    );
  }

  return NextResponse.json(getTemplate(docType), { status: 200 });
}
