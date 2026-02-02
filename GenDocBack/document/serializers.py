"""
Serializers pour l'API Documents.
Gère la sérialisation des modèles Document et TemplateVersion.
"""

from rest_framework import serializers
from .models import (
    CategorieTemplate, TemplateDocument, Formulaire,
    Question, TypeDocument, DocumentGenere, ReponseQuestion
)


class CategorieTemplateSerializer(serializers.ModelSerializer):
    """Serializer pour les catégories de templates"""
    templates_count = serializers.SerializerMethodField()

    class Meta:
        model = CategorieTemplate
        fields = ['id', 'nom', 'description', 'icone', 'image', 'templates_count']
        read_only_fields = ['id']

    def get_templates_count(self, obj):
        return obj.templates.filter(status=True).count()


class QuestionSerializer(serializers.ModelSerializer):
    """Serializer pour les questions du formulaire"""

    class Meta:
        model = Question
        fields = ['id', 'label', 'variable', 'type_champ', 'obligatoire']
        read_only_fields = ['id']


class FormulaireSerializer(serializers.ModelSerializer):
    """Serializer pour les formulaires avec leurs questions"""
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Formulaire
        fields = ['id', 'titre', 'date_add', 'questions']
        read_only_fields = ['id', 'date_add']


class TemplateDocumentListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des templates (vue simplifiée)"""
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)

    class Meta:
        model = TemplateDocument
        fields = ['id', 'nom', 'categorie', 'categorie_nom', 'date_add', 'status']
        read_only_fields = ['id', 'date_add']


class TemplateDocumentDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un template avec ses formulaires"""
    categorie_details = CategorieTemplateSerializer(source='categorie', read_only=True)
    formulaires = FormulaireSerializer(many=True, read_only=True)

    class Meta:
        model = TemplateDocument
        fields = [
            'id', 'nom', 'fichier', 'categorie', 'categorie_details',
            'formulaires', 'date_add', 'status'
        ]
        read_only_fields = ['id', 'date_add']


class ReponseQuestionSerializer(serializers.ModelSerializer):
    """Serializer pour les réponses aux questions"""
    question_label = serializers.CharField(source='question.label', read_only=True)
    question_variable = serializers.CharField(source='question.variable', read_only=True)

    class Meta:
        model = ReponseQuestion
        fields = ['id', 'question', 'question_label', 'question_variable', 'valeur', 'date_add']
        read_only_fields = ['id', 'date_add', 'question_label', 'question_variable']


class DocumentGenereListSerializer(serializers.ModelSerializer):
    """Serializer pour la liste des documents générés"""
    template_nom = serializers.CharField(source='template.nom', read_only=True)

    class Meta:
        model = DocumentGenere
        fields = [
            'id', 'template', 'template_nom', 'format',
            'status', 'date_generation', 'fichier'
        ]
        read_only_fields = ['id', 'date_generation']


class DocumentGenereDetailSerializer(serializers.ModelSerializer):
    """Serializer détaillé pour un document généré avec ses réponses"""
    reponses = ReponseQuestionSerializer(many=True, read_only=True)
    template_details = TemplateDocumentListSerializer(source='template', read_only=True)

    class Meta:
        model = DocumentGenere
        fields = [
            'id', 'template', 'template_details', 'format',
            'fichier', 'status', 'date_generation', 'reponses'
        ]
        read_only_fields = ['id', 'date_generation', 'fichier', 'status']


class DocumentGenereCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'un document avec ses réponses"""
    reponses = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        help_text="Liste des réponses: [{'question': 1, 'valeur': 'xxx'}, ...]"
    )

from django.core.exceptions import ValidationError
from .models import Document, DocumentAuditLog
from templates.models import TemplateVersion


class DocumentAuditLogSerializer(serializers.ModelSerializer):
    """Serializer pour l'historique d'audit des documents."""
    
    class Meta:
        model = DocumentAuditLog
        fields = ['id', 'actor', 'action', 'timestamp', 'ip_address', 'details']
        read_only_fields = ['id', 'timestamp']


class TemplateVersionReadOnlySerializer(serializers.ModelSerializer):
    """Serializer en lecture seule pour TemplateVersion."""
    
    class Meta:
        model = TemplateVersion
        fields = ['id', 'version_number', 'input_schema', 'change_log']
        read_only_fields = fields


class DocumentSerializer(serializers.ModelSerializer):
    """
    Serializer principal pour Document.
    Utilisé pour la lecture (avec détails complets).
    """
    template_version = TemplateVersionReadOnlySerializer(read_only=True)
    download_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = [
            'uuid',
            'user',
            'template_version',
            'input_data',
            'status',
            'error_log',
            'created_at',
            'completed_at',
            'output_file',
            'filename',
            'download_url'
        ]
        read_only_fields = ['uuid', 'user', 'status', 'created_at', 'completed_at', 'output_file', 'filename']

    def get_download_url(self, obj):
        """
        Retourne l'URL de téléchargement si le document est COMPLETED.
        """
        if obj.status == Document.Status.COMPLETED and obj.output_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.output_file.url)
        return None


class DocumentCreateSerializer(serializers.Serializer):
    """
    Serializer pour la création de documents.
    Gère la validation du input_data par rapport au input_schema du template.
    """
    template_version_id = serializers.IntegerField(write_only=True)
    data = serializers.JSONField(write_only=True)
    
    # Champs de réponse
    uuid = serializers.UUIDField(read_only=True)
    status = serializers.CharField(read_only=True)
    message = serializers.CharField(read_only=True)

    def validate_template_version_id(self, value):
        """Vérifie que la TemplateVersion existe."""
        try:
            return TemplateVersion.objects.get(id=value)
        except TemplateVersion.DoesNotExist:
            raise serializers.ValidationError(
                f"TemplateVersion avec l'ID {value} n'existe pas."
            )

    def validate_data(self, value):
        """Valide que 'data' est un dictionnaire valide."""
        if not isinstance(value, dict):
            raise serializers.ValidationError(
                "Le champ 'data' doit être un objet JSON (dictionnaire)."
            )
        return value

    def validate(self, data):
        """
        Validation croisée : vérifie que les données correspondent au schéma du template.
        """
        template_version = data.get('template_version_id')
        input_data = data.get('data', {})

        # Récupère le schéma du template
        input_schema = template_version.input_schema if template_version else {}

        # Validation basique : vérifier les champs requis
        if isinstance(input_schema, dict):
            for field_name, field_config in input_schema.items():
                # Vérifie si le champ est marqué comme "required"
                if isinstance(field_config, dict) and field_config.get('required', False):
                    if field_name not in input_data:
                        raise serializers.ValidationError({
                            'data': f"Champ requis manquant : '{field_name}'"
                        })

        # Vous pouvez étendre cette logique pour vérifier les types
        # Ex: if field_config.get('type') == 'email': valider le format email
        
        return data

    def create(self, validated_data):
        """
        Crée le Document.
        La génération se fait dans la vue (mode synchrone).
        """
        template_version = validated_data['template_version_id']
        input_data = validated_data['data']
        user = self.context['request'].user

        # Crée le document avec le statut PROCESSING
        # (sera changé à COMPLETED dans la vue après génération)
        document = Document.objects.create(
            user=user,
            template_version=template_version,
            input_data=input_data,
            status=Document.Status.PROCESSING
        )

        return {
            'uuid': document.uuid,
            'status': document.status,
            'message': 'Document en cours de génération...'
        }


class DocumentStatusSerializer(serializers.ModelSerializer):
    """
    Serializer pour vérifier le statut d'un document (polling).
    Champs minimaux pour éviter de charger trop de données.
    """
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = ['uuid', 'status', 'error_log', 'completed_at', 'filename', 'download_url']
        read_only_fields = fields

    def get_download_url(self, obj):
        """Retourne l'URL de téléchargement si disponible."""
        if obj.status == Document.Status.COMPLETED and obj.output_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.output_file.url)
        return None

    class Meta:
        model = DocumentGenere
        fields = ['template', 'format', 'reponses']

    def validate_reponses(self, value):
        """vérification que toutes les questions obligatoires ont une réponse"""
        if not value:
            raise serializers.ValidationError("Au moins une réponse est requise")

        for reponse in value:
            if 'question' not in reponse or 'valeur' not in reponse:
                raise serializers.ValidationError(
                    "Chaque réponse doit contenir 'question' et 'valeur'"
                )

        return value

    def validate(self, data):
        """Validation globale incluant les questions obligatoires"""
        template = data.get('template')
        reponses = data.get('reponses', [])

        formulaires = template.formulaires.all()
        if not formulaires.exists():
            raise serializers.ValidationError(
                "Ce template n'a pas de formulaire associé"
            )

        for formulaire in formulaires:
            questions_obligatoires = formulaire.questions.filter(obligatoire=True)
            questions_repondues = [r['question'] for r in reponses]

            for question in questions_obligatoires:
                if question.id not in questions_repondues:
                    raise serializers.ValidationError(
                        f"La question '{question.label}' est obligatoire"
                    )

        return data

    def create(self, validated_data):
        """Créer le document et ses réponses"""
        reponses_data = validated_data.pop('reponses')

        document = DocumentGenere.objects.create(
            template=validated_data['template'],
            format=validated_data['format'],
            status='pending'
        )

        for reponse_data in reponses_data:
            ReponseQuestion.objects.create(
                document=document,
                question_id=reponse_data['question'],
                valeur=reponse_data['valeur']
            )

        return document


class TypeDocumentSerializer(serializers.ModelSerializer):
    """Serializer pour les types de documents"""

    class Meta:
        model = TypeDocument
        fields = ['id', 'nom', 'extension', 'status']
        read_only_fields = ['id']