"""
Views (APIView) pour l'API Documents.
Gère les endpoints de génération de documents (MODE SYNCHRONE).
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.http import FileResponse
from django.utils import timezone
from django.db import transaction
from django.core.files.base import ContentFile

from .models import Document, DocumentAuditLog
from .serializers import (
    DocumentSerializer,
    DocumentCreateSerializer,
    DocumentStatusSerializer
)
from .services import DocumentService
from templates.models import TemplateVersion


class DocumentGenerateAPIView(APIView):
    """
    POST /api/documents/generate/
    
    Génère un document de manière SYNCHRONE et retourne directement le fichier.
    
    Request JSON:
    {
        "template_version_id": 12,
        "data": {
            "nom": "Dupont",
            "age": 35,
            ...
        }
    }
    
    Response:
    - Succès (200): Retourne le fichier généré directement (FileResponse)
    - Erreur (400): JSON avec détail de l'erreur
    """
    
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """Génère un document synchroniquement et retourne le fichier."""
        
        # Valide les données
        serializer = DocumentCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response(
                {
                    'errors': serializer.errors,
                    'message': 'Erreur de validation des données'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        validated_data = serializer.validated_data
        template_version_id = validated_data['template_version_id']
        input_data = validated_data['data']
        user = request.user
        
        try:
            # Récupère le template
            template_version = TemplateVersion.objects.get(id=template_version_id)
            
            # Crée le document en base (statut PROCESSING initialement)
            document = Document.objects.create(
                user=user,
                template_version=template_version,
                input_data=input_data,
                status=Document.Status.PROCESSING
            )
            
            # Génère le fichier synchroniquement
            file_content, filename = DocumentService.generate(template_version, input_data)
            
            # Sauvegarde le fichier généré
            with transaction.atomic():
                document.output_file.save(filename, ContentFile(file_content))
                document.status = Document.Status.COMPLETED
                document.completed_at = timezone.now()
                document.save()
            
            # Enregistre dans l'audit
            DocumentAuditLog.objects.create(
                document=document,
                actor=user,
                action='GENERATE',
                ip_address=self._get_client_ip(request),
                details={'method': 'synchronous_api'}
            )
            
            # Retourne le fichier directement au client
            response = FileResponse(
                ContentFile(file_content),
                as_attachment=True,
                filename=filename
            )
            response['Content-Type'] = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            
            return response
            
        except TemplateVersion.DoesNotExist:
            # Si le document a été créé mais le template n'existe pas
            if 'document' in locals():
                document.status = Document.Status.FAILED
                document.error_log = 'Template non trouvé'
                document.save()
            
            return Response(
                {
                    'error': 'Template non trouvé',
                    'message': f'Le template avec l\'ID {template_version_id} n\'existe pas'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except ValueError as e:
            # Erreur de génération (Jinja2, format, etc.)
            if 'document' in locals():
                document.status = Document.Status.FAILED
                document.error_log = str(e)
                document.save()
            
            return Response(
                {
                    'error': 'Erreur de génération',
                    'message': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            # Erreur inattendue
            if 'document' in locals():
                document.status = Document.Status.FAILED
                document.error_log = f'Erreur serveur : {str(e)}'
                document.save()
            
            return Response(
                {
                    'error': 'Erreur serveur',
                    'message': 'Une erreur inattendue s\'est produite'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @staticmethod
    def _get_client_ip(request):
        """Récupère l'IP du client depuis la requête."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip



class DocumentListAPIView(APIView):
    """
    GET /api/documents/
    
    Liste tous les documents de l'utilisateur connecté.
    Utile pour afficher l'historique.
    """
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Récupère la liste des documents de l'utilisateur."""
        documents = Document.objects.filter(user=request.user).order_by('-created_at')
        serializer = DocumentSerializer(documents, many=True, context={'request': request})
        return Response(serializer.data)


class DocumentStatusAPIView(APIView):
    """
    GET /api/documents/{uuid}/
    
    Permet au frontend de "poller" (vérifier) le statut du document.
    Si status == 'COMPLETED', inclut l'URL de téléchargement.
    
    Response:
    {
        "uuid": "550e8400-e29b-41d4-a716-446655440000",
        "status": "COMPLETED",
        "filename": "document_dupont_2024.docx",
        "download_url": "http://api.example.com/api/documents/{uuid}/download/",
        "completed_at": "2024-02-01T14:30:00Z",
        "error_log": null
    }
    """
    
    permission_classes = [IsAuthenticated]

    def get(self, request, uuid, *args, **kwargs):
        """Récupère le statut d'un document."""
        
        # Récupère le document et vérifie que l'utilisateur en est le propriétaire
        document = get_object_or_404(
            Document,
            uuid=uuid,
            user=request.user
        )
        
        serializer = DocumentStatusSerializer(
            document,
            context={'request': request}
        )
        
        return Response(serializer.data, status=status.HTTP_200_OK)


class DocumentDetailAPIView(APIView):
    """
    GET /api/documents/{uuid}/detail/
    
    Récupère les détails complets d'un document (plus riche que le statut).
    Inclut l'input_data et le template_version.
    
    Response: Utilise DocumentSerializer pour des détails complets.
    """
    
    permission_classes = [IsAuthenticated]

    def get(self, request, uuid, *args, **kwargs):
        """Récupère les détails complets d'un document."""
        
        document = get_object_or_404(
            Document,
            uuid=uuid,
            user=request.user
        )
        
        serializer = DocumentSerializer(
            document,
            context={'request': request}
        )
        
        return Response(serializer.data, status=status.HTTP_200_OK)


class DocumentDownloadAPIView(APIView):
    """
    GET /api/documents/{uuid}/download/
    
    Sert le fichier physique si le statut est COMPLETED.
    Utilise FileResponse de Django pour optimiser le streaming.
    
    Response: Fichier binaire avec les headers appropriés
    """
    
    permission_classes = [IsAuthenticated]

    def get(self, request, uuid, *args, **kwargs):
        """Télécharge le fichier généré."""
        
        # Récupère le document
        document = get_object_or_404(
            Document,
            uuid=uuid,
            user=request.user
        )
        
        # Vérifie que le document est complété
        if document.status != Document.Status.COMPLETED:
            return Response(
                {
                    'error': 'Le document n\'est pas prêt',
                    'status': document.status,
                    'message': f'Statut actuel : {document.get_status_display()}'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifie que le fichier existe
        if not document.output_file:
            return Response(
                {
                    'error': 'Fichier non trouvé',
                    'message': 'Le fichier de sortie n\'existe pas'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            # Enregistre l'action de téléchargement dans l'audit
            self._log_download_audit(request, document)
            
            # Ouvre le fichier et crée la réponse
            file = document.output_file.open('rb')
            response = FileResponse(
                file,
                as_attachment=True,
                filename=document.filename
            )
            
            # Définit les headers appropriés
            response['Content-Type'] = 'application/octet-stream'
            response['Content-Disposition'] = f'attachment; filename="{document.filename}"'
            
            return response
            
        except Exception as e:
            return Response(
                {
                    'error': 'Erreur lors du téléchargement',
                    'message': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _log_download_audit(self, request, document):
        """Enregistre l'action de téléchargement dans l'historique d'audit."""
        try:
            DocumentAuditLog.objects.create(
                document=document,
                actor=request.user,
                action='DOWNLOADED',
                ip_address=self._get_client_ip(request),
                details={
                    'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                    'timestamp': timezone.now().isoformat()
                }
            )
        except Exception as e:
            # Log l'erreur mais ne bloque pas le téléchargement
            print(f"Erreur lors de l'enregistrement d'audit : {e}")
    
    @staticmethod
    def _get_client_ip(request):
        """Extrait l'IP du client à partir du request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class DocumentListAPIView(APIView):
    """
    GET /api/documents/
    
    Liste tous les documents de l'utilisateur connecté (pagination optionnelle).
    Utile pour afficher l'historique.
    """
    
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """Récupère la liste des documents de l'utilisateur."""
        
        documents = Document.objects.filter(user=request.user).order_by('-created_at')
        
        # Pagination simple
        page = request.query_params.get('page', 1)
        limit = request.query_params.get('limit', 20)
        
        try:
            page = int(page)
            limit = int(limit)
        except ValueError:
            page = 1
            limit = 20
        
        start = (page - 1) * limit
        end = start + limit
        
        total_count = documents.count()
        paginated_docs = documents[start:end]
        
        serializer = DocumentStatusSerializer(
            paginated_docs,
            many=True,
            context={'request': request}
        )
        
        return Response(
            {
                'count': total_count,
                'page': page,
                'limit': limit,
                'results': serializer.data
            },
            status=status.HTTP_200_OK
        )


class DocumentDeleteAPIView(APIView):
    """
    DELETE /api/documents/{uuid}/
    
    Supprime un document (soft delete ou hard delete selon la politique).
    """
    
    permission_classes = [IsAuthenticated]

    def delete(self, request, uuid, *args, **kwargs):
        """Supprime un document."""
        
        document = get_object_or_404(
            Document,
            uuid=uuid,
            user=request.user
        )
        
        # Enregistre la suppression dans l'audit avant de supprimer
        try:
            DocumentAuditLog.objects.create(
                document=document,
                actor=request.user,
                action='DELETED',
                ip_address=self._get_client_ip(request)
            )
        except:
            pass
        
        # Supprime le document et son fichier
        file_name = document.filename
        document.delete()
        
        return Response(
            {
                'message': f'Document {file_name} supprimé avec succès',
                'uuid': str(uuid)
            },
            status=status.HTTP_204_NO_CONTENT
        )
    
    @staticmethod
    def _get_client_ip(request):
        """Extrait l'IP du client."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
