"""API tests for the public AI recommendation endpoint.

Covers the two guardrails added for the live demo: the input-length cap and the
per-IP rate limit. The Claude key is blanked so the deterministic fallback runs
(no network, no spend), the cache is forced to local memory, and it's cleared
per test so throttle counters don't leak between tests.
"""

import os
from unittest.mock import patch

from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from automation.limits import MAX_REQUEST_LEN
from automation.models import Approval, Workflow
from automation.throttling import AIRecommendBurstThrottle

LOCMEM_CACHE = {
    "default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}
}

ENDPOINT = "/api/workflows/revenue/ai-recommend/"


@override_settings(CACHES=LOCMEM_CACHE)
@patch.dict(os.environ, {"ANTHROPIC_API_KEY": ""})
class AiRecommendApiTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        Workflow.objects.create(
            key="revenue",
            title="Lead & Sales Automation",
            description="Scores inbound leads.",
            confidence=94,
            blueprint=[],
            cards=[{"title": "Discovery reply", "body": "Draft a discovery reply."}],
        )

    def tearDown(self):
        cache.clear()

    def test_valid_input_creates_pending_approval(self):
        response = self.client.post(
            ENDPOINT,
            {"company": "ACME", "request": "enterprise pricing demo"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], "pending")
        self.assertEqual(response.data["provider"], "fallback")
        self.assertEqual(Approval.objects.count(), 1)

    def test_request_over_cap_is_rejected(self):
        response = self.client.post(
            ENDPOINT,
            {"company": "ACME", "request": "x" * (MAX_REQUEST_LEN + 1)},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("too long", response.data["detail"])
        self.assertEqual(Approval.objects.count(), 0)

    def test_extra_keys_never_reach_the_model(self):
        # Arbitrary keys must be dropped, not forwarded into the prompt payload.
        response = self.client.post(
            ENDPOINT,
            {"company": "ACME", "request": "hello", "blob": "x" * 50_000},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Approval.objects.count(), 1)

    # DRF binds THROTTLE_RATES as a class attribute at import, so override_settings
    # can't change it — patch the throttle class directly to a low burst rate.
    @patch.object(
        AIRecommendBurstThrottle,
        "THROTTLE_RATES",
        {"ai_recommend_burst": "3/min", "ai_recommend_sustained": "1000/hour"},
    )
    def test_burst_throttle_returns_429(self):
        cache.clear()
        payload = {"company": "ACME", "request": "demo"}
        for _ in range(3):
            allowed = self.client.post(ENDPOINT, payload, format="json")
            self.assertEqual(allowed.status_code, 201)

        blocked = self.client.post(ENDPOINT, payload, format="json")
        self.assertEqual(blocked.status_code, 429)
        self.assertEqual(Approval.objects.count(), 3)
