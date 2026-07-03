
import fitz
from pathlib import Path

PDF_PATH = Path(
    r"P:\AI NEW PROJ\Trionic\trionic-ai-adalat\corpus\acts\negotiable_instruments_act\snapshot-2026-06-11\a1881-26.pdf"
)

OUTPUT_PATH = Path(
    r"P:\AI NEW PROJ\Trionic\trionic-ai-adalat\corpus\acts\negotiable_instruments_act\snapshot-2026-06-11\cleaned-text.md"
)

if not PDF_PATH.exists():
    raise FileNotFoundError(
        f"PDF not found: {PDF_PATH}"
    )

print(f"Opening PDF: {PDF_PATH}")

doc = fitz.open(PDF_PATH)

print(f"Total pages: {len(doc)}")

text_parts = []

section_138_page = None

for page_number, page in enumerate(doc, start=1):
    page_text = page.get_text()

    text_parts.append(page_text)

    if (
        section_138_page is None
        and "138." in page_text
    ):
        section_138_page = page_number

full_text = "\n".join(text_parts)

print(
    f"Total extracted characters: {len(full_text)}"
)

OUTPUT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True,
)

OUTPUT_PATH.write_text(
    full_text,
    encoding="utf-8",
)

print(
    f"Written to: {OUTPUT_PATH}"
)

saved_text = OUTPUT_PATH.read_text(
    encoding="utf-8"
)

print(
    f"Verification chars: {len(saved_text)}"
)

print("\nFirst 500 characters:\n")
print(saved_text[:500])

if section_138_page:
    print(
        f"\nSection 138 first appears on page: {section_138_page}"
    )

    page_text = doc[
        section_138_page - 1
    ].get_text()

    print(
        "\nPreview around Section 138:\n"
    )

    print(page_text[:2000])

else:
    print(
        "\nCould not locate '138.' in extracted text."
    )

print(
    "\nExtraction completed successfully."
)
