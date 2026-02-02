import uuid
import os
from django.db import models
from django.conf import settings
from apps.templates.models import TemplateVersion

class Document(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'En attente'
        PROCESSING = 'PROCESSING', 'En cours de génération'
        COMPLETED = 'COMPLETED', 'Terminé'
        FAILED = 'FAILED', 'Échec'

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    # Lien vers l'utilisateur (Django Auth)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='documents', on_delete=models.CASCADE)
    
    # CRITIQUE : On lie à une VERSION spécifique, pas juste au Template global.
    # Cela garantit que si le template change demain, ce document reste intègre.
    template_version = models.ForeignKey(TemplateVersion, related_name='generated_docs', on_delete=models.PROTECT)
    
    # Les réponses de l'utilisateur au formulaire (JSON)
    # Ex: {"nom": "Dupont", "date": "2023-10-10"}
    input_data = models.JSONField(default=dict)
    
    # Le résultat final
    output_file = models.FileField(upload_to='documents/generated/%Y/%m/', null=True, blank=True)
    
    # Gestion de la File d'attente
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    error_log = models.TextField(blank=True, help_text="Message d'erreur technique si FAILED")
    
    # Métadonnées temporelles
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Doc {self.uuid} - {self.status}"

    @property
    def filename(self):
        return os.path.basename(self.output_file.name) if self.output_file else "generating..."

class DocumentAuditLog(models.Model):
    """
    Traçabilité complète pour les entreprises (Compliance).
    Enregistre chaque action sur un document.
    """
    document = models.ForeignKey(Document, related_name='audit_logs', on_delete=models.CASCADE)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)
    
    action = models.CharField(max_length=50) # ex: 'CREATED', 'DOWNLOADED', 'REGENERATED'
    timestamp = models.DateTimeField(auto_now_add=True)
    
    # Détails techniques (IP, User-Agent)
    ip_address = models.GenericIPAddressField(null=True)
    details = models.JSONField(null=True, blank=True) # Pour stocker des diffs ou infos extra

    class Meta:
        ordering = ['-timestamp']