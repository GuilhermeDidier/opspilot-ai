from django.db import transaction
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from .ai import claude_enabled, generate_recommendation
from .models import Approval, AuditEvent, Workflow
from .serializers import ApprovalSerializer, AuditEventSerializer, WorkflowSerializer
from .seed import seed_demo_data

WORKFLOW_TYPES = {
    "revenue": "Revenue",
    "support": "Support",
    "documents": "Documents",
}


class WorkflowViewSet(viewsets.ModelViewSet):
    queryset = Workflow.objects.all()
    serializer_class = WorkflowSerializer
    lookup_field = "key"

    @action(detail=True, methods=["post"])
    def optimize(self, request, key=None):
        workflow = self.get_object()
        workflow.confidence = min(workflow.confidence + 2, 98)
        workflow.save(update_fields=["confidence", "updated_at"])
        AuditEvent.objects.create(
            workflow=workflow,
            title="Workflow optimized",
            body=f"{workflow.title} threshold tuned using latest approval outcomes.",
        )
        return Response(self.get_serializer(workflow).data)

    @action(detail=True, methods=["post"])
    def simulate(self, request, key=None):
        workflow = self.get_object()
        card = workflow.cards[-1]
        approval = Approval.objects.create(
            workflow=workflow,
            type=WORKFLOW_TYPES.get(workflow.key, "Revenue"),
            title=card["title"],
            body=f"{card['body']} Confidence: {workflow.confidence}%.",
            confidence=workflow.confidence,
            risk="High" if workflow.key == "support" else "Medium",
            time_saved=22 if workflow.key == "documents" else 31,
            next_action=card["body"],
            evidence=[
                "Workflow context matched a known automation playbook",
                "Suggested action requires human approval before external sync",
                "Audit log will capture the reviewer decision",
            ],
        )
        AuditEvent.objects.create(
            workflow=workflow,
            approval=approval,
            title="Simulation completed",
            body=f"{workflow.title} produced one new review item.",
        )
        return Response(ApprovalSerializer(approval).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="ai-recommend")
    def ai_recommend(self, request, key=None):
        workflow = self.get_object()
        recommendation = generate_recommendation(workflow, request.data)
        approval = Approval.objects.create(
            workflow=workflow,
            type=WORKFLOW_TYPES.get(workflow.key, "Revenue"),
            title=recommendation["title"],
            body=recommendation["body"],
            confidence=recommendation["confidence"],
            risk=recommendation["risk"],
            time_saved=recommendation["time_saved"],
            next_action=recommendation["next_action"],
            evidence=recommendation["evidence"],
            draft=recommendation.get("draft", ""),
            provider=recommendation["provider"],
        )
        AuditEvent.objects.create(
            workflow=workflow,
            approval=approval,
            title="AI recommendation generated",
            body=f"{workflow.title} generated a {recommendation['provider']} recommendation for review.",
        )
        return Response(ApprovalSerializer(approval).data, status=status.HTTP_201_CREATED)


class ApprovalViewSet(viewsets.ModelViewSet):
    queryset = Approval.objects.select_related("workflow").all()
    serializer_class = ApprovalSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        # Newest first so a freshly generated recommendation lands at the top of
        # the queue and is the one shown in the Decision Packet.
        return queryset.order_by("-created_at", "-id")

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        return self._review(pk, Approval.STATUS_APPROVED)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        return self._review(pk, Approval.STATUS_REJECTED)

    @action(detail=False, methods=["post"], url_path="approve-all")
    def approve_all(self, request):
        approvals = list(self.get_queryset().filter(status=Approval.STATUS_PENDING)[:5])
        with transaction.atomic():
            for approval in approvals:
                approval.status = Approval.STATUS_APPROVED
                approval.reviewed_at = timezone.now()
                approval.save(update_fields=["status", "reviewed_at"])
                AuditEvent.objects.create(
                    workflow=approval.workflow,
                    approval=approval,
                    title="Action approved",
                    body=f"{approval.title} was approved by a human reviewer.",
                )
        return Response({"approved": len(approvals)})

    def _review(self, pk, review_status):
        approval = self.get_object()
        approval.status = review_status
        approval.reviewed_at = timezone.now()
        approval.save(update_fields=["status", "reviewed_at"])
        AuditEvent.objects.create(
            workflow=approval.workflow,
            approval=approval,
            title="Action approved" if review_status == Approval.STATUS_APPROVED else "Action rejected",
            body=f"{approval.title} was {review_status} by a human reviewer.",
        )
        return Response(self.get_serializer(approval).data)


class AuditEventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditEvent.objects.select_related("workflow", "approval").all()
    serializer_class = AuditEventSerializer


@api_view(["GET"])
def health(_request):
    return Response({"status": "ok", "backend": "django", "claude": claude_enabled()})


@api_view(["POST"])
def export_audit(_request):
    AuditEvent.objects.create(
        title="Audit exported",
        body="Reviewer actions, AI rationale, and workflow metrics prepared for download.",
    )
    return Response({"status": "exported"})


@api_view(["POST"])
def seed(_request):
    seed_demo_data()
    return Response({"status": "seeded"})
