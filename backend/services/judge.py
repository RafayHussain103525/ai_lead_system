import json
from services.gemini_client import get_gemini

JUDGE_SYSTEM = "You are an impartial evaluator of AI assistant answers. Score the ANSWER against the CONTEXT and the QUERY: groundedness, relevance, clarity. Each score is 0-10. overall = mean of the three."

async def judge_answer(query: str, context: str, answer: str) -> dict | None:
    prompt = f"QUERY:\n{query}\n\nCONTEXT GIVEN TO THE ASSISTANT:\n{context[:4000]}\n\nASSISTANT ANSWER:\n{answer}\n\nRespond ONLY as JSON: {{\"groundedness\": <0-10>, \"relevance\": <0-10>, \"clarity\": <0-10>, \"overall\": <0-10>, \"explanation\": \"<one short paragraph>\"}}"
    try:
        raw = await get_gemini().generate(prompt, system=JUDGE_SYSTEM, temperature=0.0, max_tokens=512, response_json=True)
        data = json.loads(raw)
        return {
            "groundedness": float(data.get("groundedness", 0)),
            "relevance": float(data.get("relevance", 0)),
            "clarity": float(data.get("clarity", 0)),
            "overall": float(data.get("overall", 0)),
            "explanation": str(data.get("explanation", ""))[:1000],
        }
    except Exception:
        return None
