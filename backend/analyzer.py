import hashlib
import io

import filetype
from pypdf import PdfReader

MAX_FILE_SIZE = 10 * 1024 * 1024
TEXT_PREVIEW_LENGTH = 500

METADATA_KEYS = (
    "/Title",
    "/Author",
    "/Creator",
    "/Producer",
    "/CreationDate",
    "/ModDate",
)


class PdfAnalysisError(Exception):
    pass


def _is_pdf(content: bytes, filename: str) -> bool:
    if content.startswith(b"%PDF"):
        return True

    kind = filetype.guess(content)
    if kind and kind.mime == "application/pdf":
        return True

    return filename.lower().endswith(".pdf")


def analyze_pdf(content: bytes, filename: str) -> dict:
    if len(content) > MAX_FILE_SIZE:
        raise PdfAnalysisError("File exceeds the 10 MB limit.")

    if not _is_pdf(content, filename):
        raise PdfAnalysisError("Only PDF files are supported.")

    sha256 = hashlib.sha256(content).hexdigest()

    try:
        reader = PdfReader(io.BytesIO(content))
    except Exception as exc:
        raise PdfAnalysisError("Could not read PDF file.") from exc

    metadata: dict[str, str] = {}
    if reader.metadata:
        for key in METADATA_KEYS:
            value = reader.metadata.get(key)
            if value:
                metadata[key.lstrip("/")] = str(value)

    text_preview = ""
    if reader.pages and not reader.is_encrypted:
        text = reader.pages[0].extract_text() or ""
        text_preview = text.strip()[:TEXT_PREVIEW_LENGTH]

    return {
        "filename": filename,
        "size_bytes": len(content),
        "mime_type": "application/pdf",
        "sha256": sha256,
        "analysis": {
            "page_count": len(reader.pages),
            "encrypted": reader.is_encrypted,
            "metadata": metadata,
            "text_preview": text_preview,
        },
    }
