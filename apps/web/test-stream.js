// eslint-disable-next-line @typescript-eslint/no-require-imports
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const http = require('http');

async function run() {
  console.log("Creating document...");
  const docRes = await fetch("http://localhost:3000/api/documents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: "en",
      intake_text: "test draft generation",
      doc_type: "rti_application"
    })
  });
  
  if (!docRes.ok) {
    console.error("Failed to create document", await docRes.text());
    return;
  }
  
  const { document_id } = await docRes.json();
  console.log("Document created:", document_id);
  
  console.log("Starting stream...");
  const draftRes = await fetch("http://localhost:3000/api/draft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      document_id,
      language: "en",
      target_language: "en",
      intake_text: "test draft generation",
      doc_type: "rti_application"
    })
  });
  
  console.log("Stream response status:", draftRes.status);
  
  const reader = draftRes.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      console.log("Stream closed.");
      break;
    }
    console.log("Received chunk:", decoder.decode(value));
  }
}

run().catch(console.error);
