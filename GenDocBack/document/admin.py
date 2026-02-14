"""
Configuration Django Admin pour les modèles de documents.
"""

from django.contrib import admin
from django.utils.html import format_html
# On importe les vrais modèles qui existent dans ton models.py actuel
from .models import (
    CategorieTemplate,
    ChoixQuestion, 
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

class FormulaireInline(admin.StackedInline):
    model = Formulaire
    extra = 0
    show_change_link = True
    can_delete = False
    fields = ('titre', 'date_add', 'apercu_questions')
    readonly_fields = ('titre', 'date_add', 'apercu_questions')

    def apercu_questions(self, obj):
        questions = obj.questions.all()
        if not questions:
            return "Aucune question"
        
        html = '<ul style="margin-top: 0;">'
        for q in questions:
            required = '<span style="color: red;">*</span>' if q.obligatoire else ""
            html += f"<li><strong>{q.label}</strong> <code>{q.variable}</code> ({q.type_champ}) {required}</li>"
        html += "</ul>"
        return format_html(html)
    
    apercu_questions.short_description = "Questions associées"


# 2. Gestion des Templates (Modèles Word/Excel)
@admin.register(TemplateDocument)
class TemplateDocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'nom', 'categorie', 'status', 'date_add')
    list_filter = ('status', 'categorie')
    search_fields = ('nom',)
    inlines = [FormulaireInline]


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1

# 3. Gestion des Formulaires associés aux templates
@admin.register(Formulaire)
class FormulaireAdmin(admin.ModelAdmin):
    list_display = ('id', 'titre', 'template', 'date_add')
    search_fields = ('titre',)
    inlines = [QuestionInline]


class ChoixQuestionInline(admin.TabularInline):
    model = ChoixQuestion
    extra = 1

# 4. Gestion des Questions
@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'label', 'variable', 'type_champ', 'obligatoire', 'formulaire')
    list_filter = ('type_champ', 'obligatoire')
    search_fields = ('label', 'variable')
    inlines = [ChoixQuestionInline]

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