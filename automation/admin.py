from django.contrib import admin

from .models import Approval, AuditEvent, Workflow


@admin.register(Workflow)
class WorkflowAdmin(admin.ModelAdmin):
    list_display = ("title", "key", "confidence", "is_active", "updated_at")
    search_fields = ("title", "key")


@admin.register(Approval)
class ApprovalAdmin(admin.ModelAdmin):
    list_display = ("title", "type", "workflow", "status", "confidence", "risk", "created_at")
    list_filter = ("status", "type", "risk")
    search_fields = ("title", "body")


@admin.register(AuditEvent)
class AuditEventAdmin(admin.ModelAdmin):
    list_display = ("title", "workflow", "approval", "created_at")
    search_fields = ("title", "body")

# Register your models here.
