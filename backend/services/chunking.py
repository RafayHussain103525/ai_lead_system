import re
from typing import List

from llama_index.core.embeddings import BaseEmbedding
from llama_index.core.node_parser import SemanticSplitterNodeParser
from llama_index.core.schema import Document as LlamaDocument

from config import settings
from services.gemini_client import get_gemini


class GeminiLlamaEmbedding(BaseEmbedding):


    @classmethod
    def class_name(cls) -> str:
        return "GeminiLlamaEmbedding"
    def _get_query_embedding(self, query: str) -> List[float]:
        return get_gemini().embed_texts_sync([query], task_type="RETRIEVAL_QUERY")[0]

    async def _aget_query_embedding(self, query: str) -> List[float]:
        return (await get_gemini().embed_texts([query], task_type="RETRIEVAL_QUERY"))[0]

    def _get_text_embedding(self, text: str) -> List[float]:
        return get_gemini().embed_texts_sync([text], task_type="RETRIEVAL_DOCUMENT")[0]

    async def _aget_text_embedding(self, text: str) -> List[float]:
        return (await get_gemini().embed_texts([text], task_type="RETRIEVAL_DOCUMENT"))[0]

    def _get_text_embeddings(self, texts: List[str]) -> List[List[float]]:
        return get_gemini().embed_texts_sync(list(texts), task_type="RETRIEVAL_DOCUMENT")

    async def _aget_text_embeddings(self, texts: List[str]) -> List[List[float]]:
        return await get_gemini().embed_texts(list(texts), task_type="RETRIEVAL_DOCUMENT")


_SENTENCE_RE = re.compile(r"(?<=[.!?])\s+")


def _split_sentences(text: str) -> list[str]:
    return [s.strip() for s in _SENTENCE_RE.split(text) if s.strip()]


def _recursive_pack(chunk: str) -> list[str]:
    if len(chunk) <= settings.MAX_CHUNK_CHARS:
        return [chunk]
    pieces, buf = [], ""
    for s in _split_sentences(chunk):
        if len(s) > settings.MAX_CHUNK_CHARS:
            if buf:
                pieces.append(buf)
                buf = ""
            pieces.extend(s[i:i + settings.MAX_CHUNK_CHARS]
                          for i in range(0, len(s), settings.MAX_CHUNK_CHARS))
        elif len(buf) + len(s) + 1 > settings.MAX_CHUNK_CHARS:
            pieces.append(buf)
            buf = s
        else:
            buf = f"{buf} {s}".strip()
    if buf:
        pieces.append(buf)
    return pieces


def _merge_small(chunks: list[str]) -> list[str]:
    out: list[str] = []
    for c in chunks:
        if out and (len(out[-1]) < settings.MIN_CHUNK_CHARS or len(c) < settings.MIN_CHUNK_CHARS) \
                and len(out[-1]) + len(c) + 1 <= settings.MAX_CHUNK_CHARS:
            out[-1] = f"{out[-1]}\n{c}"
        else:
            out.append(c)
    return out


def recursive_semantic_chunk(text: str) -> list[str]:
    doc = LlamaDocument(text=text)
    splitter = SemanticSplitterNodeParser(
        buffer_size=1,
        breakpoint_percentile_threshold=95,
        embed_model=GeminiLlamaEmbedding(model_name=settings.GEMINI_EMBED_MODEL),
    )
    nodes = splitter.get_nodes_from_documents([doc])
    semantic_chunks = [n.get_content() for n in nodes if n.get_content().strip()]

    chunks: list[str] = []
    for c in semantic_chunks:
        chunks.extend(_recursive_pack(c))
    chunks = _merge_small(chunks)
    return [c for c in chunks if len(c.strip()) >= 50]