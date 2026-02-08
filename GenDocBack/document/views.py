# <<<<<<< Updated upstream
# from rest_framework import viewsets, status, filters
# from rest_framework.decorators import action
# from rest_framework.response import Response
# from django.shortcuts import get_object_or_404
# from django.http import HttpResponse
# import os

# # Import des modèles
# from .models import (
#     CategorieTemplate, 
#     TemplateDocument, 
#     Formulaire,
#     Question,
#     ReponseQuestion,   # <--- Ajouté
#     DocumentGenere, 
#     TypeDocument
# )

# # Import des sérialiseurs
# from .serializers import (
#     CategorieTemplateSerializer,
#     TemplateDocumentListSerializer,
#     TemplateDocumentDetailSerializer,
#     FormulaireSerializer,
#     QuestionSerializer,
#     ReponseQuestionSerializer, # <--- Ajouté
#     DocumentGenereListSerializer,
#     DocumentGenereDetailSerializer,
#     DocumentGenereCreateSerializer,
#     TypeDocumentSerializer
# )

# class CategorieTemplateViewSet(viewsets.ReadOnlyModelViewSet):
#     """API pour lister les catégories"""
#     queryset = CategorieTemplate.objects.all()
#     serializer_class = CategorieTemplateSerializer


# class TemplateDocumentViewSet(viewsets.ReadOnlyModelViewSet):
#     """API pour lister les templates"""
#     queryset = TemplateDocument.objects.filter(status=True)
#     filter_backends = [filters.SearchFilter]
#     search_fields = ['nom', 'categorie__nom']

#     def get_serializer_class(self):
#         if self.action == 'retrieve':
#             return TemplateDocumentDetailSerializer
#         return TemplateDocumentListSerializer


# class FormulaireViewSet(viewsets.ReadOnlyModelViewSet):
#     """API pour les formulaires"""
#     queryset = Formulaire.objects.all()
#     serializer_class = FormulaireSerializer


# class QuestionViewSet(viewsets.ReadOnlyModelViewSet):
#     """API pour les questions"""
#     queryset = Question.objects.all()
#     serializer_class = QuestionSerializer


# class ReponseQuestionViewSet(viewsets.ReadOnlyModelViewSet):
#     """
#     API pour les réponses (C'est celle qui manquait !)
#     """
#     queryset = ReponseQuestion.objects.all()
#     serializer_class = ReponseQuestionSerializer


# class DocumentGenereViewSet(viewsets.ModelViewSet):
#     """API pour l'historique des documents"""
#     queryset = DocumentGenere.objects.all().order_by('-date_generation')
#     filter_backends = [filters.SearchFilter]
#     search_fields = ['template__nom', 'status']

#     def get_serializer_class(self):
#         if self.action == 'create':
#             return DocumentGenereCreateSerializer
#         if self.action == 'retrieve':
#             return DocumentGenereDetailSerializer
#         return DocumentGenereListSerializer

#     # Action pour télécharger le fichier
#     @action(detail=True, methods=['get'])
#     def download(self, request, pk=None):
#         instance = self.get_object()
#         if instance.fichier and os.path.exists(instance.fichier.path):
#             with open(instance.fichier.path, 'rb') as fh:
#                 response = HttpResponse(fh.read(), content_type="application/octet-stream")
#                 response['Content-Disposition'] = 'attachment; filename=' + os.path.basename(instance.fichier.path)
#                 return response
#         return Response({'error': 'Fichier introuvable'}, status=status.HTTP_404_NOT_FOUND)


# class TypeDocumentViewSet(viewsets.ReadOnlyModelViewSet):
#     """API pour les types de documents"""
#     queryset = TypeDocument.objects.filter(status=True)
#     serializer_class = TypeDocumentSerializer
# =======
# """
# Views (APIView) pour l'API Documents.
# Gère les endpoints de gestion des formulaires et documents générés.
# """

# from rest_framework import status, viewsets
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.decorators import action
# from django.shortcuts import get_object_or_404
# from django.http import FileResponse
# from django.utils import timezone
# from django.db import transaction

# from .models import (
#     CategorieTemplate,
#     TemplateDocument,
#     Formulaire,
#     Question,
#     DocumentGenere,
#     ReponseQuestion
# )
# from .serializers import (
#     CategorieTemplateSerializer,
#     TemplateDocumentListSerializer,
#     TemplateDocumentDetailSerializer,
#     FormulaireSerializer,
#     QuestionSerializer,
#     DocumentGenereListSerializer,
#     DocumentGenereDetailSerializer,
#     ReponseQuestionSerializer
# )


# class CategorieTemplateViewSet(viewsets.ModelViewSet):
#     """
#     ViewSet pour gérer les catégories de templates.
#     GET /api/categories/ - Liste toutes les catégories
#     GET /api/categories/{id}/ - Détails d'une catégorie
#     """
    
#     queryset = CategorieTemplate.objects.all()
#     serializer_class = CategorieTemplateSerializer
#     permission_classes = [IsAuthenticated]


# class TemplateDocumentViewSet(viewsets.ModelViewSet):
#     """
#     ViewSet pour gérer les templates de documents.
#     GET /api/templates/ - Liste tous les templates
#     GET /api/templates/{id}/ - Détails d'un template
#     """
    
#     queryset = TemplateDocument.objects.filter(status=True)
#     serializer_class = TemplateDocumentListSerializer
#     permission_classes = [IsAuthenticated]
    
#     def get_serializer_class(self):
#         """Utilise un serializer détaillé pour retrieve."""
#         if self.action == 'retrieve':
#             return TemplateDocumentDetailSerializer
#         return TemplateDocumentListSerializer
    
#     def get_queryset(self):
#         """Filtre par catégorie si fournie."""
#         queryset = super().get_queryset()
#         categorie_id = self.request.query_params.get('categorie', None)
#         if categorie_id:
#             queryset = queryset.filter(categorie_id=categorie_id)
#         return queryset


# class FormulaireViewSet(viewsets.ModelViewSet):
#     """
#     ViewSet pour gérer les formulaires.
#     GET /api/formulaires/ - Liste tous les formulaires
#     GET /api/formulaires/{id}/ - Détails d'un formulaire avec ses questions
#     """
    
#     queryset = Formulaire.objects.all()
#     serializer_class = FormulaireSerializer
#     permission_classes = [IsAuthenticated]


# class QuestionViewSet(viewsets.ModelViewSet):
#     """
#     ViewSet pour gérer les questions.
#     GET /api/questions/ - Liste toutes les questions
#     GET /api/questions/{id}/ - Détails d'une question
#     """
    
#     queryset = Question.objects.all()
#     serializer_class = QuestionSerializer
#     permission_classes = [IsAuthenticated]
    
#     def get_queryset(self):
#         """Filtre par formulaire si fourni."""
#         queryset = super().get_queryset()
#         formulaire_id = self.request.query_params.get('formulaire', None)
#         if formulaire_id:
#             queryset = queryset.filter(formulaire_id=formulaire_id)
#         return queryset


# class DocumentGenereViewSet(viewsets.ModelViewSet):
#     """
#     ViewSet pour gérer les documents générés.
#     GET /api/documents/ - Liste tous les documents
#     GET /api/documents/{id}/ - Détails d'un document
#     POST /api/documents/ - Crée un nouveau document avec réponses
#     """
    
#     queryset = DocumentGenere.objects.all()
#     serializer_class = DocumentGenereListSerializer
#     permission_classes = [IsAuthenticated]
    
#     def get_serializer_class(self):
#         """Utilise un serializer détaillé pour retrieve."""
#         if self.action == 'retrieve':
#             return DocumentGenereDetailSerializer
#         return DocumentGenereListSerializer
    
#     def get_queryset(self):
#         """Filtre par statut si fourni."""
#         queryset = super().get_queryset()
#         status_filter = self.request.query_params.get('status', None)
#         if status_filter:
#             queryset = queryset.filter(status=status_filter)
#         return queryset.order_by('-date_generation')
    
#     @action(detail=True, methods=['get'])
#     def download(self, request, pk=None):
#         """
#         Télécharge le fichier généré.
#         GET /api/documents/{id}/download/
#         """
#         document = self.get_object()
        
#         if not document.fichier:
#             return Response(
#                 {
#                     'error': 'Fichier non trouvé',
#                     'status': document.status
#                 },
#                 status=status.HTTP_404_NOT_FOUND
#             )
        
#         try:
#             response = FileResponse(
#                 document.fichier.open('rb'),
#                 as_attachment=True,
#                 filename=f"{document.template.nom}_{document.id}.docx"
#             )
#             response['Content-Type'] = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
#             return response
#         except Exception as e:
#             return Response(
#                 {'error': str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
    
#     @action(detail=True, methods=['get'])
#     def reponses(self, request, pk=None):
#         """
#         Récupère les réponses d'un document.
#         GET /api/documents/{id}/reponses/
#         """
#         document = self.get_object()
#         reponses = document.reponses.all()
#         serializer = ReponseQuestionSerializer(reponses, many=True)
#         return Response(serializer.data)


# class ReponseQuestionViewSet(viewsets.ModelViewSet):
#     """
#     ViewSet pour gérer les réponses aux questions.
#     GET /api/reponses/ - Liste toutes les réponses
#     POST /api/reponses/ - Crée une nouvelle réponse
#     """
    
#     queryset = ReponseQuestion.objects.all()
#     serializer_class = ReponseQuestionSerializer
#     permission_classes = [IsAuthenticated]
    
#     def get_queryset(self):
#         """Filtre par document si fourni."""
#         queryset = super().get_queryset()
#         document_id = self.request.query_params.get('document', None)
#         if document_id:
#             queryset = queryset.filter(document_id=document_id)
#         return queryset.order_by('-date_add')
