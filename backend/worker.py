import logging
from database import run_db_job
from quota import QuotaExhausted
from services.ingestion import ingest_document
from services.rag_pipeline import run_chat

logging.basicConfig(level=logging.INFO)

def process_query(query: str, session_id: str):
    try:
        return run_db_job(run_chat, query, session_id)
    except QuotaExhausted:
        return {"message": "The AI service is at its free-tier rate limit right now — please try again in a minute."}
    except Exception:
        logging.exception("process_query failed")
        return {"message": "Sorry — the AI engine hit a snag. Please try again shortly."}

def process_document(document_id: str):
    return run_db_job(ingest_document, document_id)
