import os

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://nexus:nexus_secret@postgres:5432/nexus_ai")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "/app/uploads")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")
    GEMINI_EMBED_MODEL: str = os.getenv("GEMINI_EMBED_MODEL", "gemini-embedding-001")
    EMBED_DIM: int = int(os.getenv("EMBED_DIM", "768"))
    GEN_RPM: int = int(os.getenv("GEMINI_GEN_RPM", "15"))
    GEN_RPD: int = int(os.getenv("GEMINI_GEN_RPD", "1000"))
    EMBED_RPM: int = int(os.getenv("GEMINI_EMBED_RPM", "100"))
    TOP_K_RETRIEVE: int = int(os.getenv("TOP_K_RETRIEVE", "20"))
    TOP_K_FINAL: int = int(os.getenv("TOP_K_FINAL", "5"))
    MAX_CHUNK_CHARS: int = int(os.getenv("MAX_CHUNK_CHARS", "1400"))
    MIN_CHUNK_CHARS: int = int(os.getenv("MIN_CHUNK_CHARS", "200"))
    HISTORY_TURNS: int = int(os.getenv("HISTORY_TURNS", "6"))
    JUDGE_ENABLED: bool = os.getenv("JUDGE_ENABLED", "true").lower() == "true"
    JUDGE_STRICT: bool = os.getenv("JUDGE_STRICT", "false").lower() == "true"
    JUDGE_THRESHOLD: float = float(os.getenv("JUDGE_THRESHOLD", "6.0"))
    JWT_SECRET: str = os.getenv("JWT_SECRET", "change-me-in-production")
    JWT_ALGO: str = "HS256"
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "720"))
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "admin123")
    MAX_PDF_MB: int = int(os.getenv("MAX_PDF_MB", "20"))

settings = Settings()
