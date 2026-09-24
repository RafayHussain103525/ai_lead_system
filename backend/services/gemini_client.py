from google import genai
from google.genai import types
from config import settings
from quota import quota_guard
import asyncio

class GeminiService:
    def __init__(self) -> None:
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)

    async def generate(self, prompt: str, system: str = "", temperature: float = 0.3, max_tokens: int = 1024, response_json: bool = False) -> str:
        quota_guard.generation()
        kwargs = dict(system_instruction=system or None, temperature=temperature, max_output_tokens=max_tokens)
        if response_json:
            kwargs["response_mime_type"] = "application/json"
        resp = await self.client.aio.models.generate_content(model=settings.GEMINI_MODEL, contents=prompt, config=types.GenerateContentConfig(**kwargs))
        return (resp.text or "").strip()

    async def embed_texts(self, texts: list[str], task_type: str = "RETRIEVAL_DOCUMENT") -> list[list[float]]:
        vectors: list[list[float]] = []
        for i in range(0, len(texts), 50):
            batch = texts[i:i + 50]
            quota_guard.embedding(len(batch))
            await asyncio.sleep(1)
            resp = await self.client.aio.models.embed_content(model=settings.GEMINI_EMBED_MODEL, contents=batch, config=types.EmbedContentConfig(task_type=task_type, output_dimensionality=settings.EMBED_DIM))
            vectors.extend([list(e.values) for e in resp.embeddings])
            
        return vectors

    def embed_texts_sync(self, texts: list[str], task_type: str = "RETRIEVAL_DOCUMENT") -> list[list[float]]:
        vectors: list[list[float]] = []
        for i in range(0, len(texts), 50):
            batch = texts[i:i + 50]
            quota_guard.embedding(len(batch))
            resp = self.client.models.embed_content(model=settings.GEMINI_EMBED_MODEL, contents=batch, config=types.EmbedContentConfig(task_type=task_type, output_dimensionality=settings.EMBED_DIM))
            vectors.extend([list(e.values) for e in resp.embeddings])
        return vectors

_gemini: GeminiService | None = None

def get_gemini() -> GeminiService:
    global _gemini
    if _gemini is None:
        _gemini = GeminiService()
    return _gemini
