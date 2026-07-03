import fitz
from pathlib import Path

PDF_PATH = Path(
    "corpus/raw/rti-act-2005.pdf"
)

OUTPUT_PATH = Path(
    "corpus/acts/rti-act/snapshot-2026-05-28/cleaned-text.md"
)

doc = fitz.open(PDF_PATH)

text = ""

for page in doc:
    text += page.get_text()

OUTPUT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

with open(
    OUTPUT_PATH,
    "w",
    encoding="utf-8"
) as f:
    f.write(text)

print("RTI extraction completed successfully.")