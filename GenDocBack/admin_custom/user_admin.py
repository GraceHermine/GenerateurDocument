"""
UserAdmin personnalisé avec interface améliorée
Adapté pour le modèle User custom (email comme identifiant, nom/prenom)
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

from .modern_model_admin import ModernTemplateMixin

User = get_user_model()


class CustomUserAdmin(ModernTemplateMixin, BaseUserAdmin):
    """
    UserAdmin personnalisé pour le modèle User custom (email/nom/prenom).
    """
    # Template personnalisé pour l'ajout
    add_form_template = "admin_custom/auth/user/add_form.html"
    modern_add_form_template = "admin_custom/modern/auth/user/add_form.html"
    
    # Fieldsets pour l'édition
    fieldsets = (
        (_("Informations de connexion"), {
            "fields": ("email", "password"),
            "classes": ("wide",),
            "description": "Identifiants de connexion de l'utilisateur"
        }),
        (_("Informations personnelles"), {
            "fields": ("nom", "prenom"),
            "classes": ("wide",),
            "description": "Informations de base sur l'utilisateur"
        }),
        (_("Permissions et statut"), {
            "fields": (
                "is_active",
                "is_staff",
                "is_superuser",
            ),
            "classes": ("wide",),
            "description": "Contrôle l'accès et les permissions de l'utilisateur"
        }),
        (_("Groupes et permissions"), {
            "fields": ("groups", "user_permissions"),
            "classes": ("wide", "collapse"),
            "description": "Gestion des groupes et permissions spécifiques"
        }),
        (_("Dates importantes"), {
            "fields": ("last_login",),
            "classes": ("collapse",),
            "description": "Informations sur les dates de connexion"
        }),
    )
    
    # Fieldsets pour l'ajout
    add_fieldsets = (
        (_("Informations de connexion"), {
            "classes": ("wide",),
            "fields": ("email", "password1", "password2"),
            "description": "Créez les identifiants de connexion pour le nouvel utilisateur"
        }),
        (_("Informations personnelles"), {
            "classes": ("wide",),
            "fields": ("nom", "prenom"),
            "description": "Informations de base"
        }),
        (_("Permissions initiales"), {
            "classes": ("wide",),
            "fields": ("is_active", "is_staff", "is_superuser"),
            "description": "Définissez les permissions initiales de l'utilisateur"
        }),
    )
    
    # Affichage dans la liste
    list_display = ("email", "nom", "prenom", "is_staff", "is_active", "is_superuser")
    list_filter = ("is_staff", "is_superuser", "is_active", "groups")
    search_fields = ("email", "nom", "prenom")
    ordering = ("email",)
    
    # Filtres horizontaux pour les groupes et permissions
    filter_horizontal = ("groups", "user_permissions")
    
    # Champs en lecture seule
    readonly_fields = ("last_login",)
    
    def get_fieldsets(self, request, obj=None):
        """Retourne les fieldsets appropriés selon le contexte (ajout ou édition)"""
        if not obj:
            return self.add_fieldsets
        return super().get_fieldsets(request, obj)
