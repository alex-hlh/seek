from dataclasses import dataclass
import random


@dataclass
class RetryConfig:
    max_attempts: int = 3
    base_delay: float = 1.0
    exponential: bool = True
    jitter: bool = True

    def get_delay(self, attempt: int) -> float:
        if self.exponential:
            delay = self.base_delay * (2 ** attempt)
        else:
            delay = self.base_delay
        if self.jitter:
            delay *= random.uniform(1.0, 2.0)
        return delay

    def should_retry(self, attempt: int) -> bool:
        return attempt < self.max_attempts


def retry_with_backoff(func, retry_cfg: "RetryConfig | None" = None):
    """Decorator that retries a function with exponential backoff."""
    cfg = retry_cfg or RetryConfig()

    def wrapper(*args, **kwargs):
        attempt = 0
        while True:
            try:
                return func(*args, **kwargs)
            except Exception:
                if not cfg.should_retry(attempt):
                    raise
                import time
                time.sleep(cfg.get_delay(attempt))
                attempt += 1

    return wrapper