# import uuid
# import os
# from django.db import models
# from django.conf import settings
# from apps.templates.models import TemplateVersion

from django.db import models
from django.conf import settings
from templates.models import TemplateVersion


# Create your models here.
class CategorieTemplate(models.Model):
    nom = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    icone = models.CharField(max_length=50, blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)

    class Meta:
        verbose_name = "Catégorie de template"
        verbose_name_plural = "Catégories de templates"

    def __str__(self):
        return self.nom


class TemplateDocument(models.Model):
    categorie = models.ForeignKey(
        CategorieTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="templates"
    )
    nom = models.CharField(max_length=255)
    fichier = models.FileField(upload_to='templates/')
    date_add = models.DateTimeField(auto_now_add=True)
    status = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Template document'
        verbose_name_plural = 'Templates documents'

    def __str__(self):
        return self.nom


class Formulaire(models.Model):
    template = models.ForeignKey(
        TemplateDocument,
        on_delete=models.CASCADE,
        related_name="formulaires"
    )
    titre = models.CharField(max_length=255)
    date_add = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Formulaire'
        verbose_name_plural = 'Formulaires'

    def __str__(self):
        return self.titre


class Question(models.Model):
    TYPE_CHAMP_CHOICES = [
        ('text', 'Texte'),
        ('date', 'Date'),
        ('number', 'Nombre'),
        ('email', 'Email'),
        ('select', 'Liste déroulante'),
    ]

    formulaire = models.ForeignKey(
        Formulaire,
        on_delete=models.CASCADE,
        related_name='questions'
    )
    label = models.CharField(max_length=255)
    variable = models.CharField(
        max_length=100,
        help_text="Nom de la variable utilisée dans le template Word"
    )
    type_champ = models.CharField(
        max_length=50,
        choices=TYPE_CHAMP_CHOICES
    )
    obligatoire = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Question'
        verbose_name_plural = 'Questions'

    def __str__(self):
        return self.label


class ChoixQuestion(models.Model):
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='choix'
    )
    valeur = models.CharField(max_length=255)

    def __str__(self):
        return self.valeur


class TypeDocument(models.Model):
    nom = models.CharField(max_length=50)
    extension = models.CharField(max_length=10)
    status = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Type de document'
        verbose_name_plural = 'Types de documents'

    def __str__(self):
        return self.nom


class DocumentGenere(models.Model):
    PDF = 'pdf'
    DOCX = 'docx'

    FORMAT_CHOICES = [
        (PDF, 'PDF'),
        (DOCX, 'Word'),
    ]

    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('processing', 'En cours'),
        ('done', 'Terminé'),
        ('error', 'Erreur'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documents_generes'
    )
    template = models.ForeignKey(
        TemplateDocument,
        on_delete=models.CASCADE,
        related_name='documents_generes'
    )
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES)
    fichier = models.FileField(
        upload_to='documents_generes/',
        blank=True,
        null=True
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    date_generation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Document généré'
        verbose_name_plural = 'Documents générés'

    def __str__(self):
        return f"{self.template.nom} ({self.format})"


class ReponseQuestion(models.Model):
    document = models.ForeignKey(
        DocumentGenere,
        on_delete=models.CASCADE,
        related_name="reponses"
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="reponses"
    )
    valeur = models.TextField()
    date_add = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Réponse question'
        verbose_name_plural = 'Réponses questions'

    def __str__(self):
        return f"{self.question.label} : {self.valeur}"