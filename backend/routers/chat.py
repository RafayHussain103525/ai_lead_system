from fastapi import APIRouter, Request
from rate_limit import limiter
from rq_client import queue
from schemas import ChatRequest

router = APIRouter(tags=["chat"])

@router.post("/chat")
@limiter.limit("10/minute")
async def chat(request: Request, payload: ChatRequest):
    from worker import process_query
    job = queue.enqueue(process_query, payload.query, payload.session_id, job_timeout=600, result_ttl=3600)
    return {"job_id": job.id, "status": "processing"}

@router.get("/job-status")
@limiter.limit("60/minute")
async def job_status(request: Request, job_id: str):
    job = queue.fetch_job(job_id=job_id)
    if not job:
        return {"status": "not_found"}
    if job.is_finished:
        return {"status": "completed", "result": job.result}
    if job.is_failed:
        return {"status": "failed"}
    return {"status": "processing"}
