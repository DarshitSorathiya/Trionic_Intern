import fitz
from pathlib import Path

SNAPSHOT_ID = "2024-12-01"

BASE_DIR = Path(__file__).resolve().parents[3]

PDF_PATH = (
    BASE_DIR
    / "corpus"
    / "acts"
    / "ipc"
    / f"snapshot-{SNAPSHOT_ID}"
    / "ipc.pdf"
)

OUTPUT_PATH = (
    BASE_DIR
    / "corpus"
    / "acts"
    / "ipc"
    / f"snapshot-{SNAPSHOT_ID}"
    / "cleaned-text.md"
)

doc = fitz.open(PDF_PATH)

text = ""

for page in doc:
    text += page.get_text()

with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    f.write(text)

print("IPC text extraction complete.")