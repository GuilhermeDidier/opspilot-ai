"""URL configuration for OpsPilot AI.

Routes the Django REST API under /api/ and serves the built React (Vite) SPA
from frontend/dist/. Run `cd frontend && npm install && npm run build` to
generate the bundle; in dev, run the Vite server (`npm run dev`) which proxies
/api back to this Django app.
"""
from django.conf import settings
from django.contrib import admin
from django.http import FileResponse, HttpResponse
from django.urls import include, path, re_path
from django.views.static import serve
from rest_framework.routers import DefaultRouter

from automation.views import (
    ApprovalViewSet,
    AuditEventViewSet,
    WorkflowViewSet,
    export_audit,
    health,
    seed,
)

FRONTEND_DIST = settings.BASE_DIR / "frontend" / "dist"

router = DefaultRouter()
router.register("workflows", WorkflowViewSet, basename="workflow")
router.register("approvals", ApprovalViewSet, basename="approval")
router.register("audit-events", AuditEventViewSet, basename="audit-event")


def frontend(_request):
    index = FRONTEND_DIST / "index.html"
    if not index.exists():
        return HttpResponse(
            "Frontend build not found. Run: cd frontend && npm install && npm run build",
            status=503,
            content_type="text/plain",
        )
    return FileResponse(open(index, "rb"))


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/health/", health, name="health"),
    path("api/audit/export/", export_audit, name="export-audit"),
    path("api/seed/", seed, name="seed-demo-data"),
    re_path(
        r"^assets/(?P<path>.*)$",
        serve,
        {"document_root": FRONTEND_DIST / "assets"},
    ),
    path("favicon.svg", serve, {"document_root": FRONTEND_DIST, "path": "favicon.svg"}),
    path("", frontend),
]
