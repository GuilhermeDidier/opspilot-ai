"""Rate limits for the public AI recommendation endpoint.

The endpoint is unauthenticated and spends a shared Claude API key, so two
stacked, IP-keyed limits protect it: a *burst* limit smooths rapid clicks, and a
*sustained* limit caps total spend per IP per hour. Rates come from
``DEFAULT_THROTTLE_RATES`` in settings and are env-overridable.

Throttle counters live in the configured cache. On Render the cache is the
database (see ``CACHES`` in settings), so the counts are shared across gunicorn
workers — a per-process cache would let each worker grant the full quota.
"""

from rest_framework.throttling import AnonRateThrottle


class AIRecommendBurstThrottle(AnonRateThrottle):
    """Short-window limit (e.g. 8/min) to absorb rapid repeated submissions."""

    scope = "ai_recommend_burst"


class AIRecommendSustainedThrottle(AnonRateThrottle):
    """Long-window limit (e.g. 40/hour) bounding total cost per visitor."""

    scope = "ai_recommend_sustained"
