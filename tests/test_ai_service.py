import unittest
from unittest.mock import patch

from automation.ai import claude_enabled, fallback_recommendation


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
        self.assertGreater(result["confidence"], 0)


if __name__ == "__main__":
    unittest.main()
