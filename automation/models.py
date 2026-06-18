from django.db import models


class Workflow(models.Model):
    DISPLAY_ORDER = {
        "revenue": 1,
        "support": 2,
        "documents": 3,
    }

    key = models.SlugField(unique=True)
    title = models.CharField(max_length=120)
    description = models.TextField()
    confidence = models.PositiveSmallIntegerField(default=80)
    blueprint = models.JSONField(default=list)
    cards = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.title


class Approval(models.Model):
    STATUS_PENDING = "pending"
    STATUS_APPROVED = "approved"
    STATUS_REJECTED = "rejected"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_REJECTED, "Rejected"),
    ]

    workflow = models.ForeignKey(Workflow, related_name="approvals", on_delete=models.CASCADE)
    type = models.CharField(max_length=60)
    title = models.CharField(max_length=160)
    body = models.TextField()
    confidence = models.PositiveSmallIntegerField(default=82)
    risk = models.CharField(max_length=40, default="Medium")
    time_saved = models.PositiveIntegerField(default=20)
    next_action = models.TextField(blank=True)
    evidence = models.JSONField(default=list)
    draft = models.TextField(blank=True)
    provider = models.CharField(max_length=40, default="system")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["status", "id"]

    def __str__(self):
        return self.title


class AuditEvent(models.Model):
    title = models.CharField(max_length=120)
    body = models.TextField()
    workflow = models.ForeignKey(Workflow, null=True, blank=True, on_delete=models.SET_NULL)
    approval = models.ForeignKey(Approval, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
