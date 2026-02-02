import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _

class TimeStampedModel(models.Model):
    """Classe abstraite pour gérer automatiquement les dates de création/modif."""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Category(TimeStampedModel):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcategories'
    )

    class Meta:
        verbose_name = "Catégorie"
        verbose_name_plural = "Catégories"

    def __str__(self):
        full_path = [self.name]
        k = self.parent
        while k is not None:
            full_path.append(k.name)
            k = k.parent
        return ' -> '.join(full_path[::-1])

class Template(TimeStampedModel):
    """
    Le conteneur principal du document.
    Note : Le fichier physique n'est PAS ici, mais dans TemplateVersion.
    """
    class EngineType(models.TextChoices):
        DOCXTPL = 'DOCXTPL', 'Word (Jinja2)'
        WEASYPRINT = 'WEASYPRINT', 'HTML to PDF'
        EXCEL = 'OPENPYXL', 'Excel'

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    title = models.CharField(max_length=200)
    category = models.ForeignKey(Category, related_name='templates', on_delete=models.SET_NULL, null=True)
    description = models.TextField(help_text="Description pour l'utilisateur final")
    
    engine = models.CharField(
        max_length=20, 
        choices=EngineType.choices, 
        default=EngineType.DOCXTPL
    )
    
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

    @property
    def current_version(self):
        """Retourne la dernière version active du template."""
        return self.versions.filter(is_active=True).order_by('-version_number').first()

class TemplateVersion(TimeStampedModel):
    """
    Gère le versioning. Si on change le fichier source ou le formulaire,
    on crée une nouvelle version pour ne pas casser les documents existants.
    """
    template = models.ForeignKey(Template, related_name='versions', on_delete=models.CASCADE)
    version_number = models.PositiveIntegerField()
    
    # Le fichier source avec les placeholders (ex: {{ client_name }})
    source_file = models.FileField(upload_to='templates/sources/%Y/%m/')
    
    # L'INTELLIGENCE : Définition du formulaire
    # Ex: [{"name": "nom", "type": "text", "required": true}]
    input_schema = models.JSONField(default=dict)
    
    # Optionnel : Un exemple de fichier PDF généré pour la prévisualisation
    preview_image = models.ImageField(upload_to='templates/previews/', null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    change_log = models.CharField(max_length=255, help_text="Qu'est-ce qui a changé ?")

    class Meta:
        unique_together = ('template', 'version_number')
        ordering = ['-version_number']

    def __str__(self):
        return f"{self.template.title} v{self.version_number}"