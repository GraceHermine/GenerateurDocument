from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Template, TemplateVersion
from .serializers import (
    CategorySerializer,
    TemplateSerializer,
    TemplateListSerializer,
    TemplateVersionSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les catégories de templates.
    
    - list: Liste toutes les catégories
    - retrieve: Détails d'une catégorie
    - create: Créer une nouvelle catégorie (admin)
    - update: Modifier une catégorie (admin)
    - delete: Supprimer une catégorie (admin)
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['parent']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class TemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les templates.
    
    - list: Liste tous les templates actifs
    - retrieve: Détails d'un template avec sa version actuelle
    - create: Créer un nouveau template (admin)
    - update: Modifier un template (admin)
    - delete: Supprimer un template (admin)
    - versions: Liste toutes les versions d'un template
    """
    queryset = Template.objects.filter(is_active=True)
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'engine', 'is_active']
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TemplateListSerializer
        return TemplateSerializer
    
    @action(detail=True, methods=['get'])
    def versions(self, request, pk=None):
        """Liste toutes les versions d'un template."""
        template = self.get_object()
        versions = template.versions.all()
        serializer = TemplateVersionSerializer(versions, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def schema(self, request, pk=None):
        """Retourne le schéma d'input de la version actuelle."""
        template = self.get_object()
        version = template.current_version
        if not version:
            return Response(
                {'error': 'Aucune version active pour ce template'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response({
            'template_id': template.id,
            'template_title': template.title,
            'version_number': version.version_number,
            'input_schema': version.input_schema
        })


class TemplateVersionViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les versions de templates.
    
    - list: Liste toutes les versions
    - retrieve: Détails d'une version
    - create: Créer une nouvelle version (admin)
    - update: Modifier une version (admin)
    - delete: Supprimer une version (admin)
    """
    queryset = TemplateVersion.objects.all()
    serializer_class = TemplateVersionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['template', 'is_active']
    ordering_fields = ['version_number', 'created_at']
    ordering = ['-version_number']

