from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
import os

# Import des modèles
from .models import (
    CategorieTemplate, 
    TemplateDocument, 
    Formulaire,
    Question,
    ReponseQuestion,   # <--- Ajouté
    DocumentGenere, 
    TypeDocument
)

# Import des sérialiseurs
from .serializers import (
    CategorieTemplateSerializer,
    TemplateDocumentListSerializer,
    TemplateDocumentDetailSerializer,
    FormulaireSerializer,
    QuestionSerializer,
    ReponseQuestionSerializer, # <--- Ajouté
    DocumentGenereListSerializer,
    DocumentGenereDetailSerializer,
    DocumentGenereCreateSerializer,
    TypeDocumentSerializer
)

class CategorieTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    """API pour lister les catégories"""
    queryset = CategorieTemplate.objects.all()
    serializer_class = CategorieTemplateSerializer


class TemplateDocumentViewSet(viewsets.ReadOnlyModelViewSet):
    """API pour lister les templates"""
    queryset = TemplateDocument.objects.filter(status=True)
    filter_backends = [filters.SearchFilter]
    search_fields = ['nom', 'categorie__nom']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TemplateDocumentDetailSerializer
        return TemplateDocumentListSerializer


class FormulaireViewSet(viewsets.ReadOnlyModelViewSet):
    """API pour les formulaires"""
    queryset = Formulaire.objects.all()
    serializer_class = FormulaireSerializer


class QuestionViewSet(viewsets.ReadOnlyModelViewSet):
    """API pour les questions"""
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer


class ReponseQuestionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API pour les réponses (C'est celle qui manquait !)
    """
    queryset = ReponseQuestion.objects.all()
    serializer_class = ReponseQuestionSerializer


class DocumentGenereViewSet(viewsets.ModelViewSet):
    """API pour l'historique des documents"""
    queryset = DocumentGenere.objects.all().order_by('-date_generation')
    filter_backends = [filters.SearchFilter]
    search_fields = ['template__nom', 'status']

    def get_serializer_class(self):
        if self.action == 'create':
            return DocumentGenereCreateSerializer
        if self.action == 'retrieve':
            return DocumentGenereDetailSerializer
        return DocumentGenereListSerializer

    # Action pour télécharger le fichier
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        instance = self.get_object()
        if instance.fichier and os.path.exists(instance.fichier.path):
            with open(instance.fichier.path, 'rb') as fh:
                response = HttpResponse(fh.read(), content_type="application/octet-stream")
                response['Content-Disposition'] = 'attachment; filename=' + os.path.basename(instance.fichier.path)
                return response
        return Response({'error': 'Fichier introuvable'}, status=status.HTTP_404_NOT_FOUND)


class TypeDocumentViewSet(viewsets.ReadOnlyModelViewSet):
    """API pour les types de documents"""
    queryset = TypeDocument.objects.filter(status=True)
    serializer_class = TypeDocumentSerializer