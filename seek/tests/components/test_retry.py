import pytest
from seek.src.components.retry import RetryConfig

def test_exponential_delay_calculation():
    cfg = RetryConfig(max_attempts=3, base_delay=1.0, exponential=True, jitter=False)
    assert cfg.get_delay(0) == 1.0  # 1.0 * 2^0
    assert cfg.get_delay(1) == 2.0  # 1.0 * 2^1
    assert cfg.get_delay(2) == 4.0  # 1.0 * 2^2

def test_fixed_delay_calculation():
    cfg = RetryConfig(max_attempts=3, base_delay=2.0, exponential=False, jitter=False)
    assert cfg.get_delay(0) == 2.0
    assert cfg.get_delay(1) == 2.0
    assert cfg.get_delay(2) == 2.0

def test_jitter_adds_randomness():
    cfg = RetryConfig(max_attempts=10, base_delay=1.0, exponential=True, jitter=True)
    delays = [cfg.get_delay(1) for _ in range(10)]
    assert len(set(delays)) > 1, "Jitter should produce varied delays"

def test_should_retry():
    cfg = RetryConfig(max_attempts=3)
    assert cfg.should_retry(0) is True
    assert cfg.should_retry(1) is True
    assert cfg.should_retry(2) is True
    assert cfg.should_retry(3) is False
    assert cfg.should_retry(4) is False