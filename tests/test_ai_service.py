import json
import sys
import types
import unittest
from unittest.mock import MagicMock, patch

from automation.ai import claude_enabled, fallback_recommendation, generate_recommendation, grounded_evidence


class DummyWorkflow:
    key = "revenue"
    title = "Lead & Sales Automation"
    description = "Scores inbound leads."
    confidence = 94


class AiServiceTests(unittest.TestCase):
    def test_claude_disabled_without_api_key(self):
        with patch.dict("os.environ", {}, clear=True):
            self.assertFalse(claude_enabled())

    def test_fallback_recommendation_returns_draft(self):
        result = fallback_recommendation(DummyWorkflow(), {"company": "ACME", "request": "enterprise pricing demo"})

        self.assertEqual(result["provider"], "fallback")
        self.assertEqual(result["risk"], "Low")
        self.assertIn("draft", result)

    def test_fallback_scores_nothing_and_quotes_only_the_input(self):
        payload = {"company": "ACME", "request": "Enterprise pricing demo next week"}
        result = fallback_recommendation(DummyWorkflow(), payload)

        self.assertIsNone(result["confidence"])
        self.assertEqual(result["evidence"], ["demo", "pricing", "enterprise"])


class GroundedEvidenceTests(unittest.TestCase):
    payload = {"company": "Northwind", "request": "We are  evaluating a switch before our renewal in March."}

    def test_keeps_verbatim_quotes_whatever_the_case_and_spacing(self):
        self.assertEqual(
            grounded_evidence(["evaluating a switch", "\u201cRenewal in March\u201d"], self.payload),
            ["evaluating a switch", "Renewal in March"],
        )

    def test_drops_claims_the_input_does_not_contain(self):
        self.assertEqual(
            grounded_evidence(["Customer has 3 open tickets", "renewal is worth $40k", "a"], self.payload),
            [],
        )


def fake_anthropic(reply):
    """An `anthropic` module whose client answers with `reply` as JSON text."""
    module = types.ModuleType("anthropic")
    module.APIError = type("APIError", (Exception,), {})
    block = MagicMock(type="text", text=json.dumps(reply))
    module.Anthropic = MagicMock(return_value=MagicMock(**{"messages.create.return_value": MagicMock(content=[block])}))
    return module


class ClaudeRecommendationTests(unittest.TestCase):
    def test_model_cannot_score_itself_or_cite_facts_not_in_the_input(self):
        reply = {
            "title": "Discovery reply",
            "body": "Northwind is ready to buy.",
            "confidence": 97,
            "time_saved": 240,
            "risk": "Low",
            "next_action": "Book a call.",
            "evidence": ["enterprise pricing", "Signed an NDA last quarter"],
            "draft": "Hi Northwind",
        }
        payload = {"company": "Northwind", "request": "Looking at enterprise pricing."}
        with patch.dict("os.environ", {"ANTHROPIC_API_KEY": "test"}), patch.dict(
            sys.modules, {"anthropic": fake_anthropic(reply)}
        ):
            result = generate_recommendation(DummyWorkflow(), payload)

        self.assertEqual(result["provider"], "claude")
        self.assertIsNone(result["confidence"])
        self.assertEqual(result["time_saved"], 34)
        self.assertEqual(result["evidence"], ["enterprise pricing"])


if __name__ == "__main__":
    unittest.main()
