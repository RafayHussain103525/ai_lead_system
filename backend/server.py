from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from rq_client import queue
from worker import process_query

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Status": "API Gateway is Live!"}

@app.post("/chat")
def chat(query: str, session_id: str):
    # Puts the request in Valkey so a worker can grab it
    job = queue.enqueue(process_query, query, session_id)
    return {"job_id": job.id, "status": "processing"}

@app.get('/job-status')
def get_result(job_id: str):
    job = queue.fetch_job(job_id=job_id)
    if not job:
        return {"status": "not_found"}
    if job.is_finished:
        return {"status": "completed", "result": job.result}
    elif job.is_failed:
        return {"status": "failed"}
    else:
        return {"status": "processing"}