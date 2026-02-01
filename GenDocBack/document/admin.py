from django.contrib import admin
from document import models


# Register your models here.
class CategorieTemplateAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'nom',
        'icone',
    )
    list_filter = (
        'id',
        'nom',
    )


class TemplateDocumentAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'nom',
        'categorie',
        'status',
        'date_add',
    )
    list_filter = (
        'id',
        'categorie',
        'status',
        'date_add',
    )


class FormulaireAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'titre',
        'template',
        'date_add',
    )
    list_filter = (
        'id',
        'template',
        'date_add',
    )


class QuestionAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'label',
        'variable',
        'type_champ',
        'obligatoire',
        'formulaire',
    )
    list_filter = (
        'id',
        'type_champ',
        'obligatoire',
        'formulaire',
    )


class TypeDocumentAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'nom',
        'extension',
        'status',
    )
    list_filter = (
        'id',
        'status',
        'extension',
    )


class DocumentGenereAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'template',
        'format',
        'status',
        'date_generation',
    )
    list_filter = (
        'id',
        'format',
        'status',
        'date_generation',
    )


class ReponseQuestionAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'question',
        'document',
        'valeur',
        'date_add',
    )
    list_filter = (
        'id',
        'question',
        'document',
        'date_add',
    )


def _register(model, admin_class):
    admin.site.register(model, admin_class)


_register(models.CategorieTemplate, CategorieTemplateAdmin)
_register(models.TemplateDocument, TemplateDocumentAdmin)
_register(models.Formulaire, FormulaireAdmin)
_register(models.Question, QuestionAdmin)
_register(models.TypeDocument, TypeDocumentAdmin)
_register(models.DocumentGenere, DocumentGenereAdmin)
_register(models.ReponseQuestion, ReponseQuestionAdmin)