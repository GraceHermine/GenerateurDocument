"""
Configuration Django Admin pour les modèles de documents.
À intégrer dans apps/document/admin.py
"""

from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _

from .models import Document, DocumentAuditLog


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    """Admin pour gérer les documents générés."""
    
    list_display = [
        'uuid_short',
        'user',
        'template_version',
        'status_badge',
        'created_at',
        'completed_at',
        'actions_column'
    ]
    
    list_filter = [
        'status',
        'created_at',
        'completed_at',
        ('user', admin.RelatedOnlyFieldListFilter),
        ('template_version', admin.RelatedOnlyFieldListFilter),
    ]
    
    search_fields = ['uuid', 'user__username', 'template_version__template__title']
    
    readonly_fields = [
        'uuid',
        'created_at',
        'completed_at',
        'status',
        'error_log',
        'file_preview',
        'input_data_display',
        'audit_history'
    ]
    
    fieldsets = (
        (_('Information Générale'), {
            'fields': ('uuid', 'user', 'template_version', 'created_at', 'completed_at')
        }),
        (_('Données'), {
            'fields': ('input_data_display', 'status'),
            'classes': ('collapse',)
        }),
        (_('Résultat'), {
            'fields': ('output_file', 'file_preview'),
            'classes': ('collapse',)
        }),
        (_('Erreurs'), {
            'fields': ('error_log',),
            'classes': ('collapse',)
        }),
        (_('Audit'), {
            'fields': ('audit_history',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['retry_failed_documents', 'delete_selected']
    
    def uuid_short(self, obj):
        """Affiche les 8 premiers caractères de l'UUID."""
        return str(obj.uuid)[:8]
    uuid_short.short_description = 'UUID'
    
    def status_badge(self, obj):
        """Affiche un badge coloré du statut."""
        colors = {
            'PENDING': '#FFA500',      # Orange
            'PROCESSING': '#1E90FF',   # Bleu
            'COMPLETED': '#32CD32',    # Vert
            'FAILED': '#FF4500',       # Rouge
        }
        
        color = colors.get(obj.status, '#808080')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Statut'
    
    def file_preview(self, obj):
        """Affiche un lien de téléchargement si le fichier existe."""
        if obj.output_file:
            return format_html(
                '<a href="{}" download="{}">{} ({} bytes)</a>',
                obj.output_file.url,
                obj.filename,
                obj.filename,
                obj.output_file.size
            )
        return format_html('<em>Aucun fichier</em>')
    file_preview.short_description = 'Fichier de sortie'
    
    def input_data_display(self, obj):
        """Affiche les données d'entrée en JSON formaté."""
        import json
        try:
            formatted_json = json.dumps(obj.input_data, indent=2, ensure_ascii=False)
            return format_html(
                '<pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; font-size: 12px;">{}</pre>',
                formatted_json
            )
        except:
            return str(obj.input_data)
    input_data_display.short_description = 'Données d\'entrée'
    
    def audit_history(self, obj):
        """Affiche l'historique d'audit du document."""
        logs = DocumentAuditLog.objects.filter(document=obj).order_by('-timestamp')
        
        if not logs.exists():
            return format_html('<em>Aucun audit</em>')
        
        html = '<table style="width: 100%; border-collapse: collapse;">'
        html += '<thead><tr style="background-color: #f0f0f0;">'
        html += '<th style="border: 1px solid #ddd; padding: 8px;">Action</th>'
        html += '<th style="border: 1px solid #ddd; padding: 8px;">Acteur</th>'
        html += '<th style="border: 1px solid #ddd; padding: 8px;">Date</th>'
        html += '<th style="border: 1px solid #ddd; padding: 8px;">IP</th>'
        html += '</tr></thead><tbody>'
        
        for log in logs[:10]:  # Limiter à 10 derniers logs
            html += f'<tr>'
            html += f'<td style="border: 1px solid #ddd; padding: 8px;"><strong>{log.action}</strong></td>'
            html += f'<td style="border: 1px solid #ddd; padding: 8px;">{log.actor or "Système"}</td>'
            html += f'<td style="border: 1px solid #ddd; padding: 8px;">{log.timestamp.strftime("%d/%m/%Y %H:%M")}</td>'
            html += f'<td style="border: 1px solid #ddd; padding: 8px;">{log.ip_address or "N/A"}</td>'
            html += f'</tr>'
        
        html += '</tbody></table>'
        
        if logs.count() > 10:
            html += f'<p><em>... et {logs.count() - 10} autres</em></p>'
        
        return format_html(html)
    audit_history.short_description = 'Historique d\'audit'
    
    def actions_column(self, obj):
        """Affiche des boutons d'action rapides."""
        buttons = ''
        
        if obj.status == 'COMPLETED' and obj.output_file:
            buttons += format_html(
                '<a class="button" href="{}">⬇️ Télécharger</a> ',
                obj.output_file.url
            )
        
        if obj.status == 'FAILED':
            buttons += format_html(
                '<a class="button" href="?id={}">🔄 Réessayer</a> ',
                obj.id
            )
        
        return format_html(buttons) if buttons else '-'
    actions_column.short_description = 'Actions'
    
    def retry_failed_documents(self, request, queryset):
        """Action pour réessayer les documents échoués."""
        from .tasks import generate_document_async
        
        failed_count = 0
        for document in queryset.filter(status='FAILED'):
            try:
                # Réinitialise le statut et relance la génération
                document.status = 'PENDING'
                document.error_log = ''
                document.save()
                
                generate_document_async.delay(document.id)
                failed_count += 1
            except Exception as e:
                self.message_user(
                    request,
                    f'Erreur lors du retry du document {document.uuid}: {e}',
                    level='error'
                )
        
        self.message_user(
            request,
            f'{failed_count} document(s) ont été relancés.',
            level='success'
        )
    retry_failed_documents.short_description = '🔄 Relancer la génération'
    
    def has_delete_permission(self, request):
        """Permet la suppression seulement au superuser."""
        return request.user.is_superuser


@admin.register(DocumentAuditLog)
class DocumentAuditLogAdmin(admin.ModelAdmin):
    """Admin pour l'historique d'audit des documents."""
    
    list_display = [
        'document_uuid',
        'action',
        'actor_name',
        'timestamp',
        'ip_address'
    ]
    
    list_filter = [
        'action',
        'timestamp',
        ('actor', admin.RelatedOnlyFieldListFilter),
    ]
    
    search_fields = [
        'document__uuid',
        'actor__username',
        'action',
        'ip_address'
    ]
    
    readonly_fields = [
        'document',
        'actor',
        'action',
        'timestamp',
        'ip_address',
        'details_display'
    ]
    
    fieldsets = (
        (_('Information'), {
            'fields': ('document', 'actor', 'action', 'timestamp')
        }),
        (_('Réseau'), {
            'fields': ('ip_address',)
        }),
        (_('Détails'), {
            'fields': ('details_display',),
            'classes': ('collapse',)
        }),
    )
    
    ordering = ['-timestamp']
    
    def document_uuid(self, obj):
        """Affiche l'UUID du document."""
        return str(obj.document.uuid)[:8]
    document_uuid.short_description = 'Document'
    
    def actor_name(self, obj):
        """Affiche le nom de l'acteur ou "Système"."""
        return obj.actor.get_full_name() if obj.actor else 'Système'
    actor_name.short_description = 'Acteur'
    
    def details_display(self, obj):
        """Affiche les détails en JSON formaté."""
        import json
        if obj.details:
            try:
                formatted_json = json.dumps(obj.details, indent=2, ensure_ascii=False)
                return format_html(
                    '<pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px;">{}</pre>',
                    formatted_json
                )
            except:
                return str(obj.details)
        return 'N/A'
    details_display.short_description = 'Détails'
    
    def has_add_permission(self, request):
        """Les logs d'audit ne peuvent pas être créés manuellement."""
        return False
    
    def has_delete_permission(self, request):
        """Les logs d'audit ne peuvent pas être supprimés manuellement."""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Les logs d'audit ne peuvent pas être modifiés."""
        return False
