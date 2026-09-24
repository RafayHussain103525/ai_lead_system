import asyncio
import os
from sqlalchemy import delete
from pypdf import PdfReader
from models import Chunk, Document
from services.chunking import recursive_semantic_chunk
from services.gemini_client import get_gemini

def extract_pdf(path: str) -> tuple[str, int]:
    reader = PdfReader(path)
    pages: list[str] = []
    for i, page in enumerate(reader.pages):
        try:
            t = page.extract_text() or ""
        except Exception:
            t = ""
        if t.strip():
            pages.append(f"[Page {i + 1}]\n{t}")
    return "\n\n".join(pages), len(reader.pages)

async def ingest_document(session, document_id: str) -> dict:
    doc = await session.get(Document, document_id)
    if not doc:
        raise ValueError(f"Document {document_id} not found")
    doc.status = "processing"
    await session.commit()
    try:
        if not os.path.exists(doc.stored_path):
            raise FileNotFoundError(f"Uploaded file missing: {doc.stored_path}")
        text, page_count = extract_pdf(doc.stored_path)
        if not text.strip():
            raise ValueError("No extractable text in this PDF")
        doc.page_count = page_count
        pieces = await asyncio.to_thread(recursive_semantic_chunk, text)
        vectors = await get_gemini().embed_texts(pieces, task_type="RETRIEVAL_DOCUMENT")
        await session.execute(delete(Chunk).where(Chunk.document_id == document_id))
        for idx, (piece, vec) in enumerate(zip(pieces, vectors)):
            session.add(Chunk(document_id=document_id, chunk_index=idx, content=piece, embedding=vec, meta={"char_count": len(piece)}))
        doc.chunk_count = len(pieces)
        doc.status = "ready"
        doc.error = None
        await session.commit()
        return {"document_id": document_id, "chunks": len(pieces), "pages": page_count}
    except Exception as e:
        doc.status = "failed"
        doc.error = str(e)[:2000]
        await session.commit()
        raise
