import json
from config import settings
from services.gemini_client import get_gemini

class GeminiReranker:
    async def rerank(self, query: str, chunks: list[dict]) -> list[dict]:
        if not chunks:
            return []
        if len(chunks) <= settings.TOP_K_FINAL:
            return chunks[: settings.TOP_K_FINAL]
        numbered = "\n\n".join(f"[{i}] {c['content'][:600]}" for i, c in enumerate(chunks))
        prompt = f"You are a relevance-scoring engine. Given a QUERY and numbered PASSAGES, score how well each passage helps answer the query.\n\nQUERY: {query}\n\nPASSAGES:\n{numbered}\n\nRespond ONLY as JSON: {{\"rankings\": [{{\"index\": <int>, \"score\": <0-10>}}, ...]}} covering every passage index."
        raw = await get_gemini().generate(prompt, system="You output valid JSON only. No prose.", temperature=0.0, max_tokens=2048, response_json=True)
        try:
            data = json.loads(raw)
            scored = []
            for r in data.get("rankings", []):
                i = int(r["index"])
                if 0 <= i < len(chunks):
                    chunks[i]["rerank_score"] = float(r.get("score", 0))
                    scored.append(chunks[i])
            scored.sort(key=lambda c: c.get("rerank_score", 0), reverse=True)
            return scored[: settings.TOP_K_FINAL]
        except Exception:
            return chunks[: settings.TOP_K_FINAL]
