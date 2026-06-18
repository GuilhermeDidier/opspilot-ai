from django.urls import path

from .views import health, seed


urlpatterns = [
    path("", health, name="health"),
    path("seed/", seed, name="seed-demo-data"),
]
