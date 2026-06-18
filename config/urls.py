"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.http import FileResponse
from django.urls import include, path
from django.views.static import serve
from rest_framework.routers import DefaultRouter

from automation.views import ApprovalViewSet, AuditEventViewSet, WorkflowViewSet, export_audit, health, seed
from django.conf import settings


router = DefaultRouter()
router.register("workflows", WorkflowViewSet, basename="workflow")
router.register("approvals", ApprovalViewSet, basename="approval")
router.register("audit-events", AuditEventViewSet, basename="audit-event")


def frontend(_request):
    return FileResponse(open(settings.BASE_DIR / "index.html", "rb"))

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/", include(router.urls)),
    path("api/health/", health, name="health"),
    path("api/audit/export/", export_audit, name="export-audit"),
    path("api/seed/", seed, name="seed-demo-data"),
    path("styles.css", serve, {"document_root": settings.BASE_DIR, "path": "styles.css"}),
    path("app.js", serve, {"document_root": settings.BASE_DIR, "path": "app.js"}),
    path("", frontend),
]
