"""
URLs pour l'API Documents.
Routes pour la génération, le suivi et le téléchargement de documents.
"""

from django.urls import path
from .views import (
    DocumentGenerateAPIView,
    DocumentStatusAPIView,
    DocumentDetailAPIView,
    DocumentDownloadAPIView,
    DocumentListAPIView,
    DocumentDeleteAPIView
)

app_name = 'document'

urlpatterns = [
    # Génération de documents
    path(
        'documents/generate/',
        DocumentGenerateAPIView.as_view(),
        name='document-generate'
    ),
    
    # Liste des documents de l'utilisateur
    path(
        'documents/',
        DocumentListAPIView.as_view(),
        name='document-list'
    ),
    
    # Statut d'un document (polling)
    path(
        'documents/<uuid:uuid>/',
        DocumentStatusAPIView.as_view(),
        name='document-status'
    ),
    
    # Détails complets d'un document
    path(
        'documents/<uuid:uuid>/detail/',
        DocumentDetailAPIView.as_view(),
        name='document-detail'
    ),
    
    # Téléchargement du fichier généré
    path(
        'documents/<uuid:uuid>/download/',
        DocumentDownloadAPIView.as_view(),
        name='document-download'
    ),
    
    # Suppression d'un document
    path(
        'documents/<uuid:uuid>/delete/',
        DocumentDeleteAPIView.as_view(),
        name='document-delete'
    ),
]
