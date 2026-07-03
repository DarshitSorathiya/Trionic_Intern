import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';
import { Document, Packer, Paragraph, TextRun, Header, HeadingLevel } from 'docx';
import type { ExportFormat, ExportResult } from '@trionic/shared';

// ----------------------------------------------------------------------
// TYPES & CONSTANTS
// ----------------------------------------------------------------------
type Citation = {
  id: string;
  text: string;
};

const BANNER_TEXT = "AI-generated draft — not legal advice";

// ----------------------------------------------------------------------
// MAIN API HANDLER
// ----------------------------------------------------------------------
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("[Export API] Missing PUBLIC Supabase variables.");
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // 1. INITIALIZE SUPABASE
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      }
    });

    // 2. PARSE REQUEST
    const resolvedParams = await context.params;
    const documentId = resolvedParams.id;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') as ExportFormat;
    const includeAppendix = searchParams.get('include_appendix') !== 'false'; // defaults to true

    if (format !== 'pdf' && format !== 'docx') {
      return NextResponse.json({ error: 'Unsupported format. Use pdf or docx.' }, { status: 400 });
    }

    // 3. FETCH LATEST DOCUMENT VERSION
    const { data: docVersion, error: docError } = await supabase
      .from('document_versions')
      .select('id, body_markdown')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (docError || !docVersion) {
      console.error('[Export API] DB Fetch Error or Unauthorized:', docError);
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 403 });
    }

    let rawMarkdown = docVersion.body_markdown;
    const citations: Citation[] = [];
    const citeRegex = /\[CITE:([a-zA-Z0-9_-]+)\]/g;
    const matches = [...rawMarkdown.matchAll(citeRegex)];
    const nodeIds = [...new Set(matches.map(m => m[1]))];

    if (nodeIds.length > 0 && includeAppendix) {
      const { data: nodesData, error: nodesError } = await supabase
        .from('pageindex_nodes')
        .select('id, node_path')
        .in('id', nodeIds);

      if (!nodesError && nodesData) {
        nodeIds.forEach((id, index) => {
          const node = nodesData.find(n => n.id === id);
          const footnoteNum = index + 1;
          rawMarkdown = rawMarkdown.replace(new RegExp(`\\[CITE:${id}\\]`, 'g'), `[${footnoteNum}]`);
          citations.push({
            id,
            text: `[${footnoteNum}] ${node?.node_path || 'Unknown citation source'}`
          });
        });
      }
    } else {
      rawMarkdown = rawMarkdown.replace(citeRegex, '');
    }

    const docData = { body_markdown: rawMarkdown, citations };

    // 5. GENERATE FILE BUFFER
    const fileBuffer = format === 'pdf'
      ? await buildPdf(docData, includeAppendix)
      : await buildDocx(docData, includeAppendix);

    // 6. UPLOAD TO SUPABASE STORAGE
    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).replace(/[\/\s:,]/g, '-');
    const fileName = `export_${timestamp}.${format}`;
    const filePath = `${documentId}/${fileName}`; 
    
    const contentType = format === 'pdf' 
      ? 'application/pdf' 
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    // Note: The 'exports' bucket must exist in your Supabase!
    const { error: uploadError } = await supabase.storage
      .from('exports')
      .upload(filePath, fileBuffer, { contentType, upsert: true });

    if (uploadError) {
      console.error('[Export API] Storage Upload Error:', uploadError);
      throw uploadError;
    }

    // 7. GENERATE SIGNED URL (TTL ~5 min)
    const { data: urlData, error: urlError } = await supabase.storage
      .from('exports')
      .createSignedUrl(filePath, 300);

    if (urlError || !urlData) {
      console.error('[Export API] Signed URL Error:', urlError);
      throw urlError;
    }

    // 8. RETURN RESULT
    return NextResponse.json({
      url: urlData.signedUrl,
      format: format,
      expires_at: new Date(Date.now() + 300_000).toISOString()
    } satisfies ExportResult);

  } catch (err) {
    console.error('[Export Route] Critical crash during file generation:', err);
    return NextResponse.json({ error: 'Failed to export document' }, { status: 500 });
  }
}

// ----------------------------------------------------------------------
// EXPORT ENGINES
// ----------------------------------------------------------------------

async function buildPdf(doc: { body_markdown: string, citations: Citation[] }, includeAppendix: boolean): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  let appendixHtml = '';
  if (includeAppendix && doc.citations.length > 0) {
    const listItems = doc.citations.map(c => `<li style="margin-bottom: 8px;">${c.text}</li>`).join('');
    appendixHtml = `
      <div style="margin-top: 40px; border-top: 1px solid black; padding-top: 20px;">
        <h2>Citation Appendix</h2>
        <ul style="list-style-type: none; padding-left: 0;">${listItems}</ul>
      </div>
    `;
  }

  const html = `
    <div style="text-align: center; color: red; font-weight: bold; padding-bottom: 10px; border-bottom: 1px solid #ccc; font-family: sans-serif;">
      ${BANNER_TEXT}
    </div>
    <div style="padding: 40px; font-family: serif; line-height: 1.6;">
      ${doc.body_markdown.replace(/\n/g, '<br/>')}
      ${appendixHtml}
    </div>
  `;

  await page.setContent(html);
  const pdfBytes = await page.pdf({ format: 'A4' });
  await browser.close();

  return Buffer.from(pdfBytes);
}

async function buildDocx(doc: { body_markdown: string, citations: Citation[] }, includeAppendix: boolean): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: doc.body_markdown })]
    })
  ];

  if (includeAppendix && doc.citations.length > 0) {
    children.push(
      new Paragraph({ text: "Citation Appendix", heading: HeadingLevel.HEADING_1, spacing: { before: 400 } })
    );
    doc.citations.forEach(c => {
      children.push(new Paragraph({ text: c.text }));
    });
  }

  const document = new Document({
    sections: [{
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [new TextRun({ text: BANNER_TEXT, color: "FF0000", bold: true })]
            })
          ]
        })
      },
      children
    }]
  });

  return await Packer.toBuffer(document);
}