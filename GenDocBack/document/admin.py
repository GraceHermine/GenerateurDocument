from django.contrib import admin
# On importe les vrais modèles qui existent dans ton models.py actuel
from .models import (
    CategorieTemplate, 
    TemplateDocument, 
    Formulaire, 
    Question, 
    TypeDocument, 
    DocumentGenere, 
    ReponseQuestion
)

# 1. Gestion des Catégories
@admin.register(CategorieTemplate)
class CategorieTemplateAdmin(admin.ModelAdmin):
    list_display = ('id', 'nom', 'description')
    search_fields = ('nom',)

# 2. Gestion des Templates (Modèles Word/Excel)
@admin.register(TemplateDocument)
class TemplateDocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'nom', 'categorie', 'status', 'date_add')
    list_filter = ('status', 'categorie')
    search_fields = ('nom',)

# 3. Gestion des Formulaires associés aux templates
@admin.register(Formulaire)
class FormulaireAdmin(admin.ModelAdmin):
    list_display = ('id', 'titre', 'template', 'date_add')
    search_fields = ('titre',)

# 4. Gestion des Questions
@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'label', 'variable', 'type_champ', 'obligatoire', 'formulaire')
    list_filter = ('type_champ', 'obligatoire')
    search_fields = ('label', 'variable')

# 5. Gestion des Types de documents (Extensions)
@admin.register(TypeDocument)
class TypeDocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'nom', 'extension', 'status')

# 6. Gestion des Documents Générés (C'est ton HISTORIQUE !)
@admin.register(DocumentGenere)
class DocumentGenereAdmin(admin.ModelAdmin):
    list_display = ('id', 'template', 'format', 'status', 'date_generation')
    list_filter = ('status', 'format', 'date_generation')
    readonly_fields = ('date_generation',)

# 7. Gestion des Réponses données par les utilisateurs
@admin.register(ReponseQuestion)
class ReponseQuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'document', 'question', 'valeur', 'date_add')