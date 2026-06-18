from django.test import TestCase
from rest_framework.test import APIClient

from .models import Approval, AuditEvent, Workflow
from .seed import seed_demo_data


class AutomationApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        seed_demo_data()

    def test_lists_seeded_workflows(self):
        response = self.client.get("/api/workflows/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 3)
        self.assertEqual(response.json()[0]["key"], "revenue")

    def test_simulate_creates_pending_approval_and_audit_event(self):
        response = self.client.post("/api/workflows/revenue/simulate/")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["type"], "Revenue")
        self.assertEqual(Approval.objects.filter(status=Approval.STATUS_PENDING).count(), 4)
        self.assertTrue(AuditEvent.objects.filter(title="Simulation completed").exists())

    def test_ai_recommend_creates_fallback_recommendation_without_api_key(self):
        response = self.client.post(
            "/api/workflows/revenue/ai-recommend/",
            {"company": "ACME Cloud", "request": "Need enterprise pricing automation"},
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["provider"], "fallback")
        self.assertIn("draft", response.json())
        self.assertTrue(AuditEvent.objects.filter(title="AI recommendation generated").exists())

    def test_approve_marks_approval_reviewed(self):
        approval = Approval.objects.first()

        response = self.client.post(f"/api/approvals/{approval.id}/approve/")

        self.assertEqual(response.status_code, 200)
        approval.refresh_from_db()
        self.assertEqual(approval.status, Approval.STATUS_APPROVED)
        self.assertIsNotNone(approval.reviewed_at)

    def test_seed_endpoint_restores_demo_data(self):
        Workflow.objects.all().delete()

        response = self.client.post("/api/seed/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Workflow.objects.count(), 3)
