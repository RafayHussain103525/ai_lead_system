from sqlalchemy import select
from models import Chunk, Document

async def vector_search(session, query_embedding: list[float], top_k: int) -> list[dict]:
    stmt = (
        select(Chunk, Document.filename)
        .join(Document, Chunk.document_id == Document.id)
        .where(Chunk.embedding.is_not(None))
        .order_by(Chunk.embedding.cosine_distance(query_embedding))
        .limit(top_k)
    )
    rows = (await session.execute(stmt)).all()
    return [{"chunk_id": chunk.id, "document_id": chunk.document_id, "filename": filename, "chunk_index": chunk.chunk_index, "content": chunk.content} for chunk, filename in rows]
