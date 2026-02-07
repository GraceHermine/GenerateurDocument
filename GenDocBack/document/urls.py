from django.urls import path, include
from rest_framework.routers import DefaultRouter

# On importe uniquement les ViewSets qui existent dans notre views.py corrigé
from .views import (
    CategorieTemplateViewSet,
    TemplateDocumentViewSet,
    FormulaireViewSet,
    QuestionViewSet,
    TypeDocumentViewSet,
    DocumentGenereViewSet,
    ReponseQuestionViewSet
)

app_name = 'document'

# Création du routeur automatique
router = DefaultRouter()

# Enregistrement des routes (Cela crée automatiquement les liens generate, list, detail, delete)
router.register(r'categories', CategorieTemplateViewSet, basename='categorie')
router.register(r'templates', TemplateDocumentViewSet, basename='template')
router.register(r'formulaires', FormulaireViewSet, basename='formulaire')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'types-documents', TypeDocumentViewSet, basename='type-document')

# C'est ICI que tout se passe pour l'historique et la génération
# L'URL sera : http://localhost:8000/api/documents/documents/
router.register(r'documents', DocumentGenereViewSet, basename='document')

router.register(r'reponses', ReponseQuestionViewSet, basename='reponse')

urlpatterns = [
    # On inclut toutes les routes générées par le routeur
    path('', include(router.urls)),
]