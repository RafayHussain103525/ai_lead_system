import time
from config import settings
from rq_client import redis_conn

class QuotaExhausted(Exception):
    pass

class QuotaGuard:
    def __init__(self, redis):
        self.redis = redis

    def _try(self, prefix: str, n: int, limit: int, window: int) -> float:
        key = f"quota:{prefix}:{int(time.time() // window)}"
        count = self.redis.incrby(key, n)
        if count == n:
            self.redis.expire(key, window + 2)
        if count <= limit:
            return 0.0
        self.redis.decrby(key, n)
        return window - (time.time() % window)

    def _acquire(self, prefix: str, n: int, limit: int, window: int, max_wait: float):
        deadline = time.time() + max_wait
        while True:
            wait = self._try(prefix, n, limit, window)
            if wait <= 0:
                return
            if time.time() + wait >= deadline:
                raise QuotaExhausted(f"Gemini quota '{prefix}' exhausted")
            time.sleep(min(wait, max(0.1, deadline - time.time())))

    def generation(self):
        self._acquire("gen_rpd", 1, settings.GEN_RPD, 86400, max_wait=0)
        self._acquire("gen_rpm", 1, settings.GEN_RPM, 60, max_wait=45)

    def embedding(self, n: int = 1):
        self._acquire("embed_rpm", n, settings.EMBED_RPM, 60, max_wait=75)

quota_guard = QuotaGuard(redis_conn)
