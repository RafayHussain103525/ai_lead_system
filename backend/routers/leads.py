from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_session
from models import Lead
from rate_limit import limiter
from schemas import LeadCreate

router = APIRouter(prefix="/api", tags=["leads"])

@router.post("/lead", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/hour")
async def create_lead(request: Request, payload: LeadCreate, session: AsyncSession = Depends(get_session)):
    lead = Lead(name=payload.name, email=payload.email, phone=payload.phone, company=payload.company, message=payload.message, session_id=payload.session_id, source="form")
    session.add(lead)
    await session.commit()
    return {"status": "ok", "lead_id": lead.id}
