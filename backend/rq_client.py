import os
from redis import Redis
from rq import Queue

VALKEY_URL = os.getenv("VALKEY_URL", "redis://valkey:6379/0")
redis_conn = Redis.from_url(VALKEY_URL)
queue = Queue(connection=redis_conn)