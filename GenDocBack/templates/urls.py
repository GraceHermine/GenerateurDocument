from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, TemplateViewSet, TemplateVersionViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'templates', TemplateViewSet, basename='template')
router.register(r'versions', TemplateVersionViewSet, basename='template-version')

urlpatterns = [
    path('', include(router.urls)),
]
