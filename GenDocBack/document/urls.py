from .viewset import *
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'categories', CategorieTemplateViewSet)
router.register(r'templates', TemplateDocumentViewSet)
router.register(r'formulaires', FormulaireViewSet)
router.register(r'documents', DocumentGenereViewSet)

urlpatterns = router.urls