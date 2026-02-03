"""
Configuration Django Admin pour les modèles de documents.
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import (
    CategorieTemplate,
    TemplateDocument,
    Formulaire,
    Question,
    TypeDocument,
    DocumentGenere,
    ReponseQuestion
)


class QuestionInline(admin.TabularInline):
    """Inline pour afficher les questions dans le formulaire."""
    model = Question
    extra = 1
    fields = ['label', 'variable', 'type_champ', 'obligatoire']


@admin.register(CategorieTemplate)
class CategorieTemplateAdmin(admin.ModelAdmin):
    """Admin pour gérer les catégories de templates."""
    
    list_display = ['nom', 'description', 'icone']
    search_fields = ['nom', 'description']
    list_per_page = 20


@admin.register(TemplateDocument)
class TemplateDocumentAdmin(admin.ModelAdmin):
    """Admin pour gérer les templates de documents."""
    
    list_display = ['nom', 'categorie', 'status', 'date_add', 'fichier_link']
    list_filter = ['status', 'categorie', 'date_add']
    search_fields = ['nom']
    readonly_fields = ['date_add']
    list_per_page = 20
    
    fieldsets = (
        ('Information Générale', {
            'fields': ('nom', 'categorie', 'status')
        }),
        ('Fichier', {
            'fields': ('fichier',)
        }),
        ('Dates', {
            'fields': ('date_add',),
            'classes': ('collapse',)
        }),
    )
    
    def fichier_link(self, obj):
        """Affiche un lien vers le fichier."""
        if obj.fichier:
            return format_html(
                '<a href="{}" target="_blank">📄 Voir le fichier</a>',
                obj.fichier.url
            )
        return '-'
    fichier_link.short_description = 'Fichier'


@admin.register(Formulaire)
class FormulaireAdmin(admin.ModelAdmin):
    """Admin pour gérer les formulaires."""
    
    list_display = ['titre', 'template', 'date_add', 'nombre_questions']
    list_filter = ['template', 'date_add']
    search_fields = ['titre', 'template__nom']
    readonly_fields = ['date_add']
    inlines = [QuestionInline]
    list_per_page = 20
    
    def nombre_questions(self, obj):
        """Affiche le nombre de questions."""
        return obj.questions.count()
    nombre_questions.short_description = 'Questions'


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    """Admin pour gérer les questions."""
    
    list_display = ['label', 'formulaire', 'variable', 'type_champ', 'obligatoire']
    list_filter = ['type_champ', 'obligatoire', 'formulaire']
    search_fields = ['label', 'variable', 'formulaire__titre']
    list_per_page = 20


@admin.register(TypeDocument)
class TypeDocumentAdmin(admin.ModelAdmin):
    """Admin pour gérer les types de documents."""
    
    list_display = ['nom', 'extension', 'status']
    list_filter = ['status']
    search_fields = ['nom', 'extension']
    list_per_page = 20


class ReponseQuestionInline(admin.TabularInline):
    """Inline pour afficher les réponses dans le document généré."""
    model = ReponseQuestion
    extra = 0
    readonly_fields = ['question', 'valeur', 'date_add']
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False


@admin.register(DocumentGenere)
class DocumentGenereAdmin(admin.ModelAdmin):
    """Admin pour gérer les documents générés."""
    
    list_display = [
        'id',
        'template',
        'format',
        'status_badge',
        'date_generation',
        'fichier_link'
    ]
    
    list_filter = ['status', 'format', 'date_generation', 'template']
    search_fields = ['template__nom']
    readonly_fields = ['date_generation']
    inlines = [ReponseQuestionInline]
    list_per_page = 20
    
    fieldsets = (
        ('Information Générale', {
            'fields': ('template', 'format', 'status')
        }),
        ('Fichier Généré', {
            'fields': ('fichier',)
        }),
        ('Date', {
            'fields': ('date_generation',)
        }),
    )
    
    def status_badge(self, obj):
        """Affiche un badge coloré du statut."""
        colors = {
            'pending': '#FFA500',      # Orange
            'processing': '#1E90FF',   # Bleu
            'done': '#32CD32',         # Vert
            'error': '#FF4500',        # Rouge
        }
        
        color = colors.get(obj.status, '#808080')
        status_label = obj.get_status_display()
        
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            status_label
        )
    status_badge.short_description = 'Statut'
    
    def fichier_link(self, obj):
        """Affiche un lien de téléchargement si le fichier existe."""
        if obj.fichier:
            return format_html(
                '<a href="{}" download>📥 Télécharger</a>',
                obj.fichier.url
            )
        return format_html('<em style="color: #999;">Aucun fichier</em>')
    fichier_link.short_description = 'Fichier'


@admin.register(ReponseQuestion)
class ReponseQuestionAdmin(admin.ModelAdmin):
    """Admin pour gérer les réponses aux questions."""
    
    list_display = ['question', 'document', 'valeur_courte', 'date_add']
    list_filter = ['question__formulaire', 'date_add']
    search_fields = ['question__label', 'valeur']
    readonly_fields = ['date_add']
    list_per_page = 20
    
    def valeur_courte(self, obj):
        """Affiche une version courte de la valeur."""
        if len(obj.valeur) > 50:
            return obj.valeur[:50] + '...'
        return obj.valeur
    valeur_courte.short_description = 'Valeur'
