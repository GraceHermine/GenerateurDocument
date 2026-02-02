"""
Tests pour les API de documents.
Vérifie la génération, le suivi et le téléchargement de documents.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from uuid import uuid4

from .models import Document, DocumentAuditLog
from templates.models import Template, TemplateVersion, Category


User = get_user_model()


class DocumentAPITestCase(TestCase):
    """Tests pour les endpoints de documents."""
    
    def setUp(self):
        """Initialise les données de test."""
        # Crée un utilisateur
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Crée une catégorie
        self.category = Category.objects.create(
            name='Test Category',
            slug='test-category'
        )
        
        # Crée un template
        self.template = Template.objects.create(
            title='Test Template',
            category=self.category,
            description='Template de test',
            engine=Template.EngineType.DOCXTPL
        )
        
        # Crée une version du template avec un schéma
        self.template_version = TemplateVersion.objects.create(
            template=self.template,
            version_number=1,
            source_file='templates/test.docx',  # Fichier fictif
            input_schema={
                'nom': {'type': 'text', 'required': True},
                'age': {'type': 'number', 'required': False}
            },
            is_active=True,
            change_log='Version initiale'
        )
        
        # Initialise le client API
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
    
    def test_generate_document_success(self):
        """Test la création réussie d'un document."""
        url = '/api/documents/generate/'
        
        data = {
            'template_version_id': self.template_version.id,
            'data': {
                'nom': 'Dupont',
                'age': 35
            }
        }
        
        response = self.client.post(url, data, format='json')
        
        # Vérifie le statut HTTP
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Vérifie la réponse
        self.assertIn('uuid', response.data)
        self.assertEqual(response.data['status'], Document.Status.PENDING)
        
        # Vérifie que le document a été créé en base
        doc = Document.objects.get(uuid=response.data['uuid'])
        self.assertEqual(doc.user, self.user)
        self.assertEqual(doc.template_version, self.template_version)
    
    def test_generate_document_missing_required_field(self):
        """Test l'erreur quand un champ requis est manquant."""
        url = '/api/documents/generate/'
        
        data = {
            'template_version_id': self.template_version.id,
            'data': {
                'age': 35
                # 'nom' est requis mais manquant
            }
        }
        
        response = self.client.post(url, data, format='json')
        
        # Doit retourner une erreur 400
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('errors', response.data)
    
    def test_generate_document_invalid_template(self):
        """Test l'erreur avec un template_version_id invalide."""
        url = '/api/documents/generate/'
        
        data = {
            'template_version_id': 9999,  # ID inexistant
            'data': {'nom': 'Dupont'}
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_get_document_status(self):
        """Test la récupération du statut d'un document."""
        # Crée un document
        document = Document.objects.create(
            user=self.user,
            template_version=self.template_version,
            input_data={'nom': 'Dupont'},
            status=Document.Status.PENDING
        )
        
        url = f'/api/documents/{document.uuid}/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['uuid'], str(document.uuid))
        self.assertEqual(response.data['status'], Document.Status.PENDING)
    
    def test_get_document_status_not_found(self):
        """Test l'erreur 404 si le document n'existe pas."""
        fake_uuid = uuid4()
        url = f'/api/documents/{fake_uuid}/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_get_document_status_forbidden(self):
        """Test que l'utilisateur ne peut voir que ses propres documents."""
        # Crée un autre utilisateur
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='pass123'
        )
        
        # Crée un document pour l'autre utilisateur
        document = Document.objects.create(
            user=other_user,
            template_version=self.template_version,
            input_data={'nom': 'Dupont'},
            status=Document.Status.PENDING
        )
        
        # L'utilisateur de test essaie d'accéder
        url = f'/api/documents/{document.uuid}/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_download_not_completed(self):
        """Test que le téléchargement échoue si le document n'est pas terminé."""
        document = Document.objects.create(
            user=self.user,
            template_version=self.template_version,
            input_data={'nom': 'Dupont'},
            status=Document.Status.PENDING
        )
        
        url = f'/api/documents/{document.uuid}/download/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_document_list(self):
        """Test la liste des documents de l'utilisateur."""
        # Crée quelques documents
        for i in range(3):
            Document.objects.create(
                user=self.user,
                template_version=self.template_version,
                input_data={'nom': f'User {i}'},
                status=Document.Status.COMPLETED
            )
        
        url = '/api/documents/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 3)
        self.assertEqual(len(response.data['results']), 3)
    
    def test_authentication_required(self):
        """Test que l'authentification est requise."""
        # Crée un nouveau client sans authentification
        unauth_client = APIClient()
        
        url = '/api/documents/generate/'
        data = {'template_version_id': 1, 'data': {'nom': 'Test'}}
        
        response = unauth_client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class DocumentAuditLogTestCase(TestCase):
    """Tests pour l'audit des documents."""
    
    def setUp(self):
        """Initialise les données de test."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        category = Category.objects.create(name='Test', slug='test')
        template = Template.objects.create(
            title='Test',
            category=category,
            engine=Template.EngineType.DOCXTPL
        )
        
        self.template_version = TemplateVersion.objects.create(
            template=template,
            version_number=1,
            source_file='test.docx',
            is_active=True,
            change_log='Test'
        )
    
    def test_audit_log_creation(self):
        """Test que les logs d'audit sont créés correctement."""
        document = Document.objects.create(
            user=self.user,
            template_version=self.template_version,
            input_data={'test': 'data'}
        )
        
        # Crée un log d'audit
        audit = DocumentAuditLog.objects.create(
            document=document,
            actor=self.user,
            action='DOWNLOADED',
            ip_address='127.0.0.1'
        )
        
        self.assertEqual(audit.document, document)
        self.assertEqual(audit.actor, self.user)
        self.assertEqual(audit.action, 'DOWNLOADED')
