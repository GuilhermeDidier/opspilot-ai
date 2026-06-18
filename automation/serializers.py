from rest_framework import serializers

from .models import Approval, AuditEvent, Workflow


class WorkflowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workflow
        fields = [
            "id",
            "key",
            "title",
            "description",
            "confidence",
            "blueprint",
            "cards",
            "is_active",
            "created_at",
            "updated_at",
        ]


class ApprovalSerializer(serializers.ModelSerializer):
    workflow_key = serializers.CharField(source="workflow.key", read_only=True)
    workflow_title = serializers.CharField(source="workflow.title", read_only=True)
    timeSaved = serializers.IntegerField(source="time_saved", read_only=True)
    nextAction = serializers.CharField(source="next_action", read_only=True)

    class Meta:
        model = Approval
        fields = [
            "id",
            "workflow",
            "workflow_key",
            "workflow_title",
            "type",
            "title",
            "body",
            "confidence",
            "risk",
            "time_saved",
            "timeSaved",
            "next_action",
            "nextAction",
            "evidence",
            "status",
            "created_at",
            "reviewed_at",
        ]


class AuditEventSerializer(serializers.ModelSerializer):
    workflow_key = serializers.CharField(source="workflow.key", read_only=True)
    approval_title = serializers.CharField(source="approval.title", read_only=True)

    class Meta:
        model = AuditEvent
        fields = [
            "id",
            "title",
            "body",
            "workflow",
            "workflow_key",
            "approval",
            "approval_title",
            "created_at",
        ]
