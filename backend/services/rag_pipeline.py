import json
import re
from sqlalchemy import select
from config import settings
from models import ChatMessage, Lead
from services.gemini_client import get_gemini
from services.judge import judge_answer
from services.reranker import GeminiReranker
from services.retrieval import vector_search

CONTACT_RE = re.compile(r"<contact_intent>\s*(\{.*?\})\s*</contact_intent>", re.DOTALL)

SYSTEM_PROMPT = """You are the Nexus AI assistant. Ground every factual claim in the CONTEXT documents. Be concise, professional, business-oriented. LEAD CAPTURE: if the user asks to be contacted or shares contact details, append at the very END of your reply exactly one block on its own line: <contact_intent>{"name": "...", "email": "...", "phone": "...", "note": "..."}</contact_intent>"""

def _extract_contact(text: str) -> tuple[str, dict | None]:
    m = CONTACT_RE.search(text)
    if not m:
        return text.strip(), None
    clean = CONTACT_RE.sub("", text).strip()
    try:
        data = json.loads(m.group(1))
        data = {k: str(v).strip() for k, v in dict(data).items() if str(v).strip()}
        return clean, data
    except Exception:
        return clean, None

async def _history_text(session, session_id: str) -> str:
    stmt = select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.id.desc()).limit(settings.HISTORY_TURNS)
    rows = list((await session.execute(stmt)).scalars().all())
    rows.reverse()
    return "\n".join(f"{'User' if m.role == 'user' else 'Assistant'}: {m.content[:600]}" for m in rows)

async def run_chat(session, query: str, session_id: str) -> dict:
    gemini = get_gemini()
    history = await _history_text(session, session_id)
    session.add(ChatMessage(session_id=session_id, role="user", content=query))
    await session.commit()
    query_vec = (await gemini.embed_texts([query], task_type="RETRIEVAL_QUERY"))[0]
    candidates = await vector_search(session, query_vec, settings.TOP_K_RETRIEVE)
    top_chunks = await GeminiReranker().rerank(query, candidates)
    context = "\n\n---\n\n".join(f"[{c['filename']} · part {c['chunk_index']}]\n{c['content']}" for c in top_chunks) or "(no internal documents matched this question)"
    prompt = f"CONTEXT FROM OUR DOCUMENTS:\n{context}\n\nCONVERSATION SO FAR:\n{history or '(new conversation)'}\n\nUSER'S LATEST QUESTION:\n{query}\n\nWrite your reply now."
    answer, verdict = "", None
    for attempt in range(2 if settings.JUDGE_STRICT else 1):
        answer = await gemini.generate(prompt, system=SYSTEM_PROMPT, temperature=0.3, max_tokens=1024)
        if not settings.JUDGE_ENABLED:
            break
        verdict = await judge_answer(query, context, answer)
        if verdict is None or verdict["overall"] >= settings.JUDGE_THRESHOLD:
            break
        if attempt == 0:
            prompt += f"\n\nNOTE: your previous draft scored {verdict['overall']}/10. Judge feedback: {verdict['explanation']} Rewrite a better answer."
    if not answer:
        answer = "I'm sorry — the AI engine is unavailable right now. Please try again in a moment."
    answer, contact = _extract_contact(answer)
    if contact and any(contact.get(k) for k in ("name", "email", "phone")):
        session.add(Lead(name=(contact.get("name") or "Chat visitor")[:120], email=(contact.get("email") or "")[:160] or None, phone=(contact.get("phone") or "")[:40] or None, message=(contact.get("note") or query)[:2000], source="chat", session_id=session_id))
    session.add(ChatMessage(session_id=session_id, role="assistant", content=answer, judge_score=(verdict or {}).get("overall"), judge_feedback=json.dumps(verdict) if verdict else None))
    await session.commit()
    return {"message": answer, "judge": verdict}
