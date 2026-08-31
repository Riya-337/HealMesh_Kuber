"""
healmesh-core/auth/rate_limiter.py

Hierarchical Rate Limiting for HealMesh SDK Ingress.
Enforces:
1. Per-Token Limit: default 10 requests / min / token
2. Aggregate SDK Ingress Limit: default 20 requests / min overall across all tokens

Guarantees that SDK volume cannot exhaust the global Core LLM budget (30 calls/min).
"""
from __future__ import annotations

import os
import threading
import time
from typing import Optional


class HierarchicalSDKRateLimiter:
    """Thread-safe sliding-window rate limiter for SDK ingress."""

    def __init__(
        self,
        per_token_limit: Optional[int] = None,
        aggregate_limit: Optional[int] = None,
        window_seconds: float = 60.0,
    ):
        self.per_token_limit = per_token_limit or int(
            os.environ.get("SDK_TOKEN_MAX_CALLS_PER_MINUTE", "10")
        )
        self.aggregate_limit = aggregate_limit or int(
            os.environ.get("SDK_AGGREGATE_MAX_CALLS_PER_MINUTE", "20")
        )
        self.window_seconds = window_seconds

        self._lock = threading.Lock()
        self._token_timestamps: dict[str, list[float]] = {}
        self._aggregate_timestamps: list[float] = []

    def check_and_record(self, token_id_str: str) -> tuple[bool, str | None]:
        """
        Check whether the request passes both per-token and aggregate limits.
        If allowed, records the timestamp and returns (True, None).
        If rejected, returns (False, error_reason).
        """
        now = time.time()
        cutoff = now - self.window_seconds

        with self._lock:
            # 1. Check & prune aggregate timestamps
            self._aggregate_timestamps = [t for t in self._aggregate_timestamps if t > cutoff]
            if len(self._aggregate_timestamps) >= self.aggregate_limit:
                return (
                    False,
                    f"Aggregate SDK rate limit exceeded ({self.aggregate_limit} requests/min across all tokens). Try again shortly.",
                )

            # 2. Check & prune per-token timestamps
            token_history = self._token_timestamps.get(token_id_str, [])
            token_history = [t for t in token_history if t > cutoff]
            if len(token_history) >= self.per_token_limit:
                self._token_timestamps[token_id_str] = token_history
                return (
                    False,
                    f"Per-token rate limit exceeded ({self.per_token_limit} requests/min). Try again shortly.",
                )

            # Allowed — record timestamp
            token_history.append(now)
            self._token_timestamps[token_id_str] = token_history
            self._aggregate_timestamps.append(now)
            return (True, None)

    def reset(self):
        """Reset all in-memory timestamps (useful for unit testing)."""
        with self._lock:
            self._token_timestamps.clear()
            self._aggregate_timestamps.clear()
