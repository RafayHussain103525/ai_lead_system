import re
from pydantic import BaseModel, field_validator

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

class ChatRequest(BaseModel):
    query: str
    session_id: str
    @field_validator("query")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("query must not be empty")
        return v.strip()

class LeadCreate(BaseModel):
    name: str
    email: str
    phone: str | None = None
    company: str | None = None
    message: str | None = None
    session_id: str | None = None
    @field_validator("email")
    @classmethod
    def valid_email(cls, v: str) -> str:
        if not EMAIL_RE.match(v or ""):
            raise ValueError("invalid email address")
        return v.strip().lower()
    @field_validator("name")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("name must not be empty")
        return v.strip()

class AdminLogin(BaseModel):
    username: str
    password: str
