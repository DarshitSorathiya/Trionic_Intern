import fitz
from pathlib import Path

PDF_PATH = Path(r"P:\AI NEW PROJ\Trionic\trionic-ai-adalat\corpus\acts\contract-act\snapshot-2026-05-19\A187209.pdf")

OUTPUT_PATH = Path(
    "corpus/acts/contract-act/snapshot-2026-05-19/cleaned-text.md"
)

doc = fitz.open(PDF_PATH)

text = ""

for page in doc:
    text += page.get_text()

OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    f.write(text)

print("Extraction completed successfully.")