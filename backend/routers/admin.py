import os
import uuid
from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from rq import Retry
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from auth import create_token, require_admin, verify_password
from config import settings
from database import get_session
from models import AdminUser, Document, Lead
from rate_limit import limiter
from rq_client import queue
from schemas import AdminLogin

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, payload: AdminLogin, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(AdminUser).where(AdminUser.username == payload.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": create_token(user.username), "token_type": "bearer"}

@router.post("/upload-pdf")
@limiter.limit("6/hour")
async def upload_pdf(request: Request, file: UploadFile = File(...), admin: str = Depends(require_admin), session: AsyncSession = Depends(get_session)):
    if (file.content_type or "") != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    content = await file.read()
    if len(content) > settings.MAX_PDF_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File too large (max {settings.MAX_PDF_MB} MB)")
    if not content.startswith(b"%PDF"):
        raise HTTPException(status_code=400, detail="Corrupted or non-PDF file")
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    doc_id = str(uuid.uuid4())
    stored = os.path.join(settings.UPLOAD_DIR, f"{doc_id}.pdf")
    with open(stored, "wb") as f:
        f.write(content)
    doc = Document(id=doc_id, filename=file.filename or "document.pdf", stored_path=stored, status="queued", uploaded_by=admin)
    session.add(doc)
    await session.commit()
    from worker import process_document
    queue.enqueue(process_document, doc_id, job_timeout=3600, retry=Retry(max=2, interval=[60, 300]))
    return {"document_id": doc_id, "filename": doc.filename, "status": "queued"}

@router.get("/documents")
async def list_documents(admin: str = Depends(require_admin), session: AsyncSession = Depends(get_session)):
    docs = (await session.execute(select(Document).order_by(Document.created_at.desc()))).scalars().all()
    return [{"id": d.id, "filename": d.filename, "status": d.status, "error": d.error, "page_count": d.page_count, "chunk_count": d.chunk_count, "created_at": d.created_at.isoformat()} for d in docs]

@router.delete("/documents/{document_id}")
async def delete_document(document_id: str, admin: str = Depends(require_admin), session: AsyncSession = Depends(get_session)):
    doc = await session.get(Document, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    try:
        os.remove(doc.stored_path)
    except OSError:
        pass
    await session.delete(doc)
    await session.commit()
    return {"status": "deleted"}

@router.get("/leads")
async def list_leads(admin: str = Depends(require_admin), session: AsyncSession = Depends(get_session)):
    leads = (await session.execute(select(Lead).order_by(Lead.created_at.desc()).limit(200))).scalars().all()
    return [{"id": l.id, "name": l.name, "email": l.email, "phone": l.phone, "company": l.company, "message": l.message, "source": l.source, "session_id": l.session_id, "status": l.status, "created_at": l.created_at.isoformat()} for l in leads]
