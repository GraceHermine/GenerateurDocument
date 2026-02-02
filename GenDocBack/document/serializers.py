"""
Serializers pour l'API Documents.
Gère la sérialisation des modèles Document et TemplateVersion.
"""

from rest_framework import serializers
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


# ReponseQuestionSerializer commenté - ces modèles n'existent plus
# class ReponseQuestionSerializer(serializers.ModelSerializer):
#     document = DocumentGenereSerializer(read_only = True)
#     document_id = serializers.PrimaryKeyRelatedField(queryset = DocumentGenere.objects.all(), write_only = True)
#     question = QuestionSerializer(read_only = True)
#     question_id = serializers.PrimaryKeyRelatedField(queryset= Question.objects.all(), write_only = True)
#     class Meta:
#         models = ReponseQuestion
#         fields = '__all__'

