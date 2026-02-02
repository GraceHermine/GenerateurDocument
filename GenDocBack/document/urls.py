from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategorieTemplateViewSet,
    TemplateDocumentViewSet,
    FormulaireViewSet,
    QuestionViewSet,
    TypeDocumentViewSet,
    DocumentGenereViewSet,
    ReponseQuestionViewSet
)

router = DefaultRouter()

router.register(r'categories', CategorieTemplateViewSet, basename='categorie')
router.register(r'templates', TemplateDocumentViewSet, basename='template')
router.register(r'formulaires', FormulaireViewSet, basename='formulaire')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'types-documents', TypeDocumentViewSet, basename='type-document')
router.register(r'documents', DocumentGenereViewSet, basename='document')
router.register(r'reponses', ReponseQuestionViewSet, basename='reponse')

urlpatterns = [
    path('', include(router.urls)),
]
